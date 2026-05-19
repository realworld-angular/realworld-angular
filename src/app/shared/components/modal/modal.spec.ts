import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Modal } from './modal';

describe('Modal', () => {
  let fixture: ComponentFixture<Modal>;
  let el: HTMLElement;
  let closeFn: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    closeFn = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: DialogRef, useValue: { close: closeFn } },
      ],
    }).overrideComponent(Modal, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(Modal);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render the title', async () => {
    fixture.componentRef.setInput('title', 'Confirm action');
    await fixture.whenStable();
    expect(el.textContent).toContain('Confirm action');
  });

  it('should have a close button', () => {
    const closeBtn = el.querySelector('[aria-label="Close dialog"]');
    expect(closeBtn).not.toBeNull();
  });

  it('should close dialog when close button is clicked', () => {
    const closeBtn = el.querySelector<HTMLButtonElement>('[aria-label="Close dialog"]')!;
    closeBtn.click();
    expect(closeFn).toHaveBeenCalled();
  });

  it('should have role document on the panel', () => {
    expect(el.querySelector('[role="document"]')).not.toBeNull();
  });
});
