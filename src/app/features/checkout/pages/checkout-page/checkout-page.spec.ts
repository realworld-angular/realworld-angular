import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckoutPage } from './checkout-page';
import { CartStore, CartData, CartItem } from '../../../cart/cart.store';

const mockCartData: CartData = {
  pizzeria: { id: 'p1', name: 'Roma', image: 'roma.jpg' },
  items: [],
  total: 0,
};

const cartDataSignal = signal<CartData | null>(null);
const isEmptySignal = signal(false);
const pizzeriaSignal = signal<{ id: string } | null>({ id: 'p1' });
const itemsSignal = signal<CartItem[]>([]);

const cartStoreStub = {
  cart: cartDataSignal,
  isEmpty: isEmptySignal,
  isLoading: signal(false),
  pizzeria: pizzeriaSignal,
  items: itemsSignal,
  clear: vi.fn(),
};

describe('CheckoutPage', () => {
  let fixture: ComponentFixture<CheckoutPage>;
  let el: HTMLElement;

  beforeEach(async () => {
    cartDataSignal.set(mockCartData);
    isEmptySignal.set(false);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: CartStore, useValue: cartStoreStub },
      ],
    }).overrideComponent(CheckoutPage, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(CheckoutPage);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render the checkout form shell', () => {
    expect(el.querySelector('form')).not.toBeNull();
  });

  it('should render a router outlet for step content', () => {
    expect(el.querySelector('router-outlet')).not.toBeNull();
  });

  it('should render progress steps', () => {
    expect(el.querySelector('.checkout-steps')).not.toBeNull();
  });

  it('should render the order summary sidebar', () => {
    expect(el.querySelector('.checkout-summary')).not.toBeNull();
  });

  it('should show empty state when cart is empty', async () => {
    isEmptySignal.set(true);
    await fixture.whenStable();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });

  it('should hide progress steps when cart is empty', async () => {
    isEmptySignal.set(true);
    await fixture.whenStable();
    expect(el.querySelector('.checkout-steps')).toBeNull();
  });
});
