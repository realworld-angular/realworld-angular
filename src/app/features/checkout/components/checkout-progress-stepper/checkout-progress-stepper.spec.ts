import { TestBed, ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { CheckoutProgressStepper } from './checkout-progress-stepper';

describe('CheckoutProgressStepper', () => {
  let fixture: ComponentFixture<CheckoutProgressStepper>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutProgressStepper],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutProgressStepper);
    fixture.componentRef.setInput('order', 1);
    fixture.componentRef.setInput('label', 'Delivery & Billing');
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should show the step number when status is null', () => {
    expect(el.querySelector('.checkout-step__number')?.textContent?.trim()).toBe('1');
    expect(el.textContent).toContain('Delivery & Billing');
  });

  it('should show a check icon when status is success', async () => {
    fixture.componentRef.setInput('status', 'success');
    await fixture.whenStable();
    expect(el.querySelector('img')?.getAttribute('src')).toContain('check.svg');
    expect(el.querySelector('.checkout-step__number')).toBeNull();
  });

  it('should show an error icon when status is error', async () => {
    fixture.componentRef.setInput('status', 'error');
    await fixture.whenStable();
    expect(el.querySelector('img')?.getAttribute('src')).toContain('error.svg');
    expect(el.querySelector('.checkout-step__number')).toBeNull();
  });

  it('should apply the active class when active is true', async () => {
    fixture.componentRef.setInput('active', true);
    await fixture.whenStable();
    expect(el.classList.contains('checkout-step--active')).toBe(true);
  });
});
