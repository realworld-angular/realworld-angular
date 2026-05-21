import { TestBed, ComponentFixture } from '@angular/core/testing';
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
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(SizeOptionField);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('options', options);
    await fixture.whenStable();
  });

  function optionLabels(): NodeListOf<HTMLElement> {
    return el.querySelectorAll('.option-item');
  }

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
    const smallLabel = Array.from(el.querySelectorAll('.option-item__label')).find((l) =>
      l.textContent?.includes('Small'),
    );
    expect(smallLabel).not.toBeNull();
    const allText = el.textContent || '';
    const smallText = allText.substring(0, allText.indexOf('Medium'));
    expect(smallText).not.toContain('€');
  });

  it('should select an option when toggled', () => {
    optionLabels()[1].click();
    expect(fixture.componentInstance.value()).toEqual({ id: 's2', label: 'Medium', price: 2 });
  });

  it('should deselect when toggling the same option', () => {
    optionLabels()[1].click();
    fixture.detectChanges();
    optionLabels()[1].querySelector<HTMLInputElement>('input')!.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('should mark touched on toggle', () => {
    expect(fixture.componentInstance.touched()).toBe(false);
    optionLabels()[0].click();
    expect(fixture.componentInstance.touched()).toBe(true);
  });

  it('should apply selected class for active option', () => {
    optionLabels()[2].click();
    fixture.detectChanges();
    const selectedLabels = el.querySelectorAll('.option-item--selected');
    expect(selectedLabels.length).toBe(1);
    expect(selectedLabels[0].textContent).toContain('Large');
  });

  it('should not toggle when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    optionLabels()[0].click();
    expect(fixture.componentInstance.value()).toBeNull();
  });
});
