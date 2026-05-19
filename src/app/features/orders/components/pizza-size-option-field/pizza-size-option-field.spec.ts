import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { SizeOptionField } from './pizza-size-option-field';
import { PizzaOption } from '../../../pizzerias/models/pizza.models';

const options: PizzaOption[] = [
  { id: 's1', label: 'Small', price: 0, sortOrder: 1 },
  { id: 's2', label: 'Medium', price: 2, sortOrder: 2 },
  { id: 's3', label: 'Large', price: 4, sortOrder: 3 },
];

describe('SizeOptionField', () => {
  let fixture: ComponentFixture<SizeOptionField>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({}).overrideComponent(SizeOptionField, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(SizeOptionField);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('options', options);
    await fixture.whenStable();
  });

  it('should render all options', () => {
    expect(el.textContent).toContain('Small');
    expect(el.textContent).toContain('Medium');
    expect(el.textContent).toContain('Large');
  });

  it('should show price for non-zero price options', () => {
    expect(el.textContent).toContain('€2.00');
    expect(el.textContent).toContain('€4.00');
  });

  it('should not show price for zero-price option', () => {
    const smallLabel = Array.from(el.querySelectorAll('.option-item__label')).find(l => l.textContent?.includes('Small'));
    expect(smallLabel).not.toBeNull();
    const allText = el.textContent || '';
    const smallText = allText.substring(0, allText.indexOf('Medium'));
    expect(smallText).not.toContain('€');
  });

  it('should select an option when toggled', () => {
    (fixture.componentInstance as any).toggle(options[1]);
    expect(fixture.componentInstance.value()).toEqual({ id: 's2', label: 'Medium', price: 2 });
  });

  it('should deselect when toggling the same option', () => {
    (fixture.componentInstance as any).toggle(options[1]);
    (fixture.componentInstance as any).toggle(options[1]);
    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('should mark touched on toggle', () => {
    expect(fixture.componentInstance.touched()).toBe(false);
    (fixture.componentInstance as any).toggle(options[0]);
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('should apply selected class for active option', () => {
    (fixture.componentInstance as any).toggle(options[2]);
    fixture.detectChanges();
    const selectedLabels = el.querySelectorAll('.option-item--selected');
    expect(selectedLabels.length).toBe(1);
    expect(selectedLabels[0].textContent).toContain('Large');
  });

  it('should not toggle when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    (fixture.componentInstance as any).toggle(options[0]);
    expect(fixture.componentInstance.value()).toBeNull();
  });
});
