import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  let fixture: ComponentFixture<StatusBadge>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(StatusBadge, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(StatusBadge);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('status', 'PENDING');
    await fixture.whenStable();
  });

  it('should show Pending for PENDING status', async () => {
    fixture.componentRef.setInput('status', 'PENDING');
    await fixture.whenStable();
    expect(el.textContent).toContain('Pending');
    expect(el.classList.contains('badge--warning')).toBe(true);
  });

  it('should show Preparing for PREPARING status', async () => {
    fixture.componentRef.setInput('status', 'PREPARING');
    await fixture.whenStable();
    expect(el.textContent).toContain('Preparing');
    expect(el.classList.contains('badge--info')).toBe(true);
  });

  it('should show Ready for READY status', async () => {
    fixture.componentRef.setInput('status', 'READY');
    await fixture.whenStable();
    expect(el.textContent).toContain('Ready');
    expect(el.classList.contains('badge--success')).toBe(true);
  });

  it('should show Delivered for DELIVERED status', async () => {
    fixture.componentRef.setInput('status', 'DELIVERED');
    await fixture.whenStable();
    expect(el.textContent).toContain('Delivered');
    expect(el.classList.contains('badge--primary')).toBe(true);
  });

  it('should show Cancelled for CANCELLED status', async () => {
    fixture.componentRef.setInput('status', 'CANCELLED');
    await fixture.whenStable();
    expect(el.textContent).toContain('Cancelled');
    expect(el.classList.contains('badge--default')).toBe(true);
  });
});
