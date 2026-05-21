import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { Textarea } from './textarea';

function createFieldStub(): { field: () => { value: () => string; touched: () => boolean; errors: () => { message: string }[]; required: () => boolean; dirty: () => boolean; valid: () => boolean; disabled: () => boolean; pending: () => boolean }; touchedSig: ReturnType<typeof signal<boolean>>; errorsSig: ReturnType<typeof signal<{ message: string }[]>>; requiredSig: ReturnType<typeof signal<boolean>>; valueSig: ReturnType<typeof signal<string>> } {
  const valueSig = signal('');
  const touchedSig = signal(false);
  const errorsSig = signal<{ message: string }[]>([]);
  const requiredSig = signal(false);
  const field = (): { value: () => string; touched: () => boolean; errors: () => { message: string }[]; required: () => boolean; dirty: () => boolean; valid: () => boolean; disabled: () => boolean; pending: () => boolean } => ({
    value: () => valueSig(),
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

describe('Textarea', () => {
  let fixture: ComponentFixture<Textarea>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(Textarea, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    });
    fixture = TestBed.createComponent(Textarea);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('formField', defaultField);
    await fixture.whenStable();
  });

  it('should render the label', async () => {
    fixture.componentRef.setInput('label', 'Description');
    await fixture.whenStable();
    expect(el.textContent).toContain('Description');
  });

  it('should show required asterisk when isRequired is true', async () => {
    fixture.componentRef.setInput('isRequired', true);
    fixture.componentRef.setInput('label', 'Bio');
    await fixture.whenStable();
    expect(el.querySelector('.field__required')).not.toBeNull();
  });

  it('should set placeholder', async () => {
    fixture.componentRef.setInput('placeholder', 'Write something');
    await fixture.whenStable();
    const textarea = el.querySelector('textarea');
    expect(textarea?.getAttribute('placeholder')).toBe('Write something');
  });

  it('should set rows', async () => {
    fixture.componentRef.setInput('rows', 6);
    await fixture.whenStable();
    const textarea = el.querySelector('textarea');
    expect(textarea?.getAttribute('rows')).toBe('6');
  });

  it('should show char count when maxLength is set', async () => {
    const { field, valueSig } = createFieldStub();
    valueSig.set('hello');
    fixture.componentRef.setInput('formField', field);
    fixture.componentRef.setInput('maxLength', 500);
    await fixture.whenStable();
    expect(el.textContent).toContain('5/500');
  });

  it('should show hint text', async () => {
    fixture.componentRef.setInput('hint', 'Optional description');
    await fixture.whenStable();
    expect(el.textContent).toContain('Optional description');
  });

  it('should show validation error when touched and errors exist', async () => {
    const { field, touchedSig, errorsSig } = createFieldStub();
    touchedSig.set(true);
    errorsSig.set([{ message: 'Too short' }]);
    fixture.componentRef.setInput('formField', field);
    await fixture.whenStable();
    expect(el.textContent).toContain('Too short');
  });
});
