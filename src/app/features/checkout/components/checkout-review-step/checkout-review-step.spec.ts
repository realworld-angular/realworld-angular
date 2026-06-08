import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Routes } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckoutReviewStep } from './checkout-review-step';
import { CheckoutWizard } from '../../services/checkout-wizard';
import { checkoutRoutes } from '../../checkout.routes';
import { CartStore } from '../../../cart/cart.store';
import { OrderApi } from '../../../orders/order-api';

const testRoutes: Routes = [{ path: 'checkout', children: checkoutRoutes }];

const cartStoreStub = {
  totalPrice: signal(30),
  pizzeria: signal<{ id: string } | null>({ id: 'p1' }),
  items: signal([
    {
      id: 'item1',
      pizza: { id: 'pizza1', name: 'Margherita', image: 'marg.jpg', basePrice: 9.5 },
      quantity: 2,
      size: { id: 's1', label: 'Large', price: 2 },
      extraToppings: [],
      totalPrice: 23,
    },
  ]),
  cart: signal({
    pizzeria: { id: 'p1', name: 'Roma', image: 'roma.jpg' },
    items: [
      {
        id: 'item1',
        pizza: { id: 'pizza1', name: 'Margherita', image: 'marg.jpg', basePrice: 9.5 },
        quantity: 2,
        size: { id: 's1', label: 'Large', price: 2 },
        extraToppings: [],
        totalPrice: 23,
      },
    ],
    total: 23,
  }),
  isEmpty: signal(false),
  clear: vi.fn(),
};

const orderApiStub = {
  createOrder: vi.fn(),
};

describe('CheckoutReviewStep', () => {
  let fixture: ComponentFixture<CheckoutReviewStep>;
  let el: HTMLElement;
  let wizard: CheckoutWizard;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(testRoutes),
        CheckoutWizard,
        { provide: CartStore, useValue: cartStoreStub },
        { provide: OrderApi, useValue: orderApiStub },
      ],
    }).overrideComponent(CheckoutReviewStep, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(CheckoutReviewStep);
    el = fixture.nativeElement;
    wizard = TestBed.inject(CheckoutWizard);
    await fixture.whenStable();
  });

  it('should render the review step heading', () => {
    expect(el.textContent).toContain('Review your order');
  });

  it('should render pizza items from cart', () => {
    expect(el.textContent).toContain('Margherita');
  });

  it('should set activeStep back to schedule on goBack', () => {
    wizard.activeStep.set('review');
    (el.querySelectorAll('rw-button')[0] as HTMLElement).click();
    expect(wizard.activeStep()).toBe('schedule');
  });

  it('should show tip options', () => {
    expect(el.textContent).toContain('No tip');
    expect(el.textContent).toContain('Custom amount');
  });

  it('should show the subtotal amount', () => {
    expect(el.textContent).toContain('23');
  });

  it('should show total with tip', () => {
    expect(el.textContent).toContain(wizard.totalWithTip().toFixed(2));
  });

  it('should render the coupon code input', () => {
    expect(el.textContent).toContain('Coupon code');
    expect(el.querySelector('input[placeholder="Enter coupon code"]')).toBeTruthy();
  });

  it('should show the default coupon hint when idle', () => {
    expect(el.textContent).toContain('Enter a coupon code to apply a discount to your order.');
    expect(el.querySelector('#coupon-hint')).toBeTruthy();
  });

  it('should show discount line when a coupon is applied', () => {
    wizard.discount.set(20);
    wizard.checkoutForm.coupon.code().value.set('SAVE20');
    fixture.detectChanges();
    expect(wizard.discountAmount()).toBe(6);
    expect(el.textContent).toContain('Discount');
    expect(el.textContent).toContain('6.00');
  });
});
