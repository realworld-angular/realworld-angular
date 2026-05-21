import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { Input } from './input';

function createFieldStub(): { field: () => { value: () => string | null; touched: () => boolean; errors: () => { message: string }[]; required: () => boolean; dirty: () => boolean; valid: () => boolean; disabled: () => boolean; pending: () => boolean }; touchedSig: ReturnType<typeof signal<boolean>>; errorsSig: ReturnType<typeof signal<{ message: string }[]>>; requiredSig: ReturnType<typeof signal<boolean>>; valueSig: ReturnType<typeof signal<string | null>> } {
  const valueSig = signal<string | null>('');
  const touchedSig = signal(false);
  const errorsSig = signal<{ message: string }[]>([]);
  const requiredSig = signal(false);
  const field = (): { value: () => string | null; touched: () => boolean; errors: () => { message: string }[]; required: () => boolean; dirty: () => boolean; valid: () => boolean; disabled: () => boolean; pending: () => boolean } => ({
    value: () => valueSig() as string | null,
    touched: () => touchedSig(),
    errors: () => errorsSig(),
    required: () => requiredSig(),
    dirty: () => false,
    valid: () => true,
    disabled: () => false,
    pending: () => false,
  });
  return { field, touchedSig, errorsSig, requiredSig, valueSig };
}

const defaultField = createFieldStub().field;

describe('Input', () => {
  let fixture: ComponentFixture<Input>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(Input, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    });
    fixture = TestBed.createComponent(Input);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('formField', defaultField);
    await fixture.whenStable();
  });

  it('should render the label', async () => {
    fixture.componentRef.setInput('label', 'Email');
    await fixture.whenStable();
    expect(el.textContent).toContain('Email');
  });

  it('should set input type', async () => {
    fixture.componentRef.setInput('type', 'email');
    await fixture.whenStable();
    const input = el.querySelector('input');
    expect(input?.getAttribute('type')).toBe('email');
  });

  it('should set placeholder', async () => {
    fixture.componentRef.setInput('placeholder', 'Enter text');
    await fixture.whenStable();
    const input = el.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Enter text');
  });

  it('should show hint text', async () => {
    fixture.componentRef.setInput('hint', 'Must be at least 8 characters');
    await fixture.whenStable();
    expect(el.textContent).toContain('Must be at least 8 characters');
  });

  it('should show required asterisk when field is required', async () => {
    const { field, requiredSig } = createFieldStub();
    requiredSig.set(true);
    fixture.componentRef.setInput('formField', field);
    fixture.componentRef.setInput('label', 'Name');
    await fixture.whenStable();
    expect(el.querySelector('.field__required')).not.toBeNull();
  });

  it('should show validation error when touched and errors exist', async () => {
    const { field, touchedSig, errorsSig } = createFieldStub();
    touchedSig.set(true);
    errorsSig.set([{ message: 'This field is required' }]);
    fixture.componentRef.setInput('formField', field);
    await fixture.whenStable();
    expect(el.textContent).toContain('This field is required');
  });

  it('should apply error class when touched and errors exist', async () => {
    const { field, touchedSig, errorsSig } = createFieldStub();
    touchedSig.set(true);
    errorsSig.set([{ message: 'Error' }]);
    fixture.componentRef.setInput('formField', field);
    await fixture.whenStable();
    expect(el.querySelector('.field--error')).not.toBeNull();
  });
});
