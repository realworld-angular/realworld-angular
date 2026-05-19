import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { Callout } from './callout';

describe('Callout', () => {
  let fixture: ComponentFixture<Callout>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(Callout, {
      set: { schemas: [NO_ERRORS_SCHEMA] },
    });
    fixture = TestBed.createComponent(Callout);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render the message text', async () => {
    fixture.componentRef.setInput('message', 'Something went wrong.');
    await fixture.whenStable();
    expect(el.textContent).toContain('Something went wrong.');
  });

  it('should render the heading when provided', async () => {
    fixture.componentRef.setInput('heading', 'Error');
    fixture.componentRef.setInput('message', 'Details.');
    await fixture.whenStable();
    expect(el.textContent).toContain('Error');
  });

  it('should have error variant styling by default', () => {
    expect(el.classList.contains('callout--error')).toBe(true);
  });

  it('should have role alert for error variant', () => {
    expect(el.getAttribute('role')).toBe('alert');
    expect(el.getAttribute('aria-live')).toBe('assertive');
  });

  it('should have role status for success variant', async () => {
    fixture.componentRef.setInput('variant', 'success');
    await fixture.whenStable();
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
  });

  it('should have no role for neutral variant', async () => {
    fixture.componentRef.setInput('variant', 'neutral');
    await fixture.whenStable();
    expect(el.getAttribute('role')).toBeNull();
    expect(el.getAttribute('aria-live')).toBeNull();
  });

  it('should apply success styling', async () => {
    fixture.componentRef.setInput('variant', 'success');
    await fixture.whenStable();
    expect(el.classList.contains('callout--success')).toBe(true);
  });

  it('should have has-heading class when heading is set', async () => {
    fixture.componentRef.setInput('heading', 'Note');
    await fixture.whenStable();
    expect(el.classList.contains('callout--has-heading')).toBe(true);
  });
});
