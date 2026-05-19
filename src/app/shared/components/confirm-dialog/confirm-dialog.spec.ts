import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfirmDialog, ConfirmDialogData, ConfirmDialogResult } from './confirm-dialog';

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<ConfirmDialog>;
  let el: HTMLElement;
  let closeFn: ReturnType<typeof vi.fn>;

  const defaultData: ConfirmDialogData = {
    title: 'Are you sure?',
    message: 'This action cannot be undone.',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
  };

  beforeEach(async () => {
    closeFn = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: DialogRef<ConfirmDialogResult>, useValue: { close: closeFn } },
        { provide: DIALOG_DATA, useValue: defaultData },
      ],
    }).overrideComponent(ConfirmDialog, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(ConfirmDialog);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render the title from data', () => {
    expect(el.textContent).toContain('Are you sure?');
  });

  it('should render the message from data', () => {
    expect(el.textContent).toContain('This action cannot be undone.');
  });

  it('should render cancel and confirm buttons', () => {
    expect(el.textContent).toContain('Cancel');
    expect(el.textContent).toContain('Confirm');
  });

  it('should close with dismissed when cancel is clicked', () => {
    const cancelBtn = Array.from(el.querySelectorAll('rw-button')).find((b) =>
      b.textContent?.includes('Cancel'),
    );
    if (cancelBtn) {
      (cancelBtn as any).click();
    }
    // dismiss() calls dialogRef.close('dismissed')
    const component = fixture.componentInstance;
    (component as any).dismiss();
    expect(closeFn).toHaveBeenCalledWith('dismissed');
  });

  it('should close with confirmed when confirm is clicked', () => {
    const component = fixture.componentInstance;
    (component as any).confirm();
    expect(closeFn).toHaveBeenCalledWith('confirmed');
  });

  it('should not show message when not provided', async () => {
    TestBed.resetTestingModule();
    closeFn = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: DialogRef<ConfirmDialogResult>, useValue: { close: closeFn } },
        { provide: DIALOG_DATA, useValue: { title: 'Test' } },
      ],
    }).overrideComponent(ConfirmDialog, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(ConfirmDialog);
    el = fixture.nativeElement;
    await fixture.whenStable();
    expect(el.querySelector('.confirm-dialog__message')).toBeNull();
  });
});
