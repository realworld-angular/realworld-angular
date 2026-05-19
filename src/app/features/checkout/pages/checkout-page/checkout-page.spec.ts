import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
  clear: () => {},
};

describe('CheckoutPage', () => {
  let fixture: ComponentFixture<CheckoutPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

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
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should render the checkout form', () => {
    expect(el.querySelector('form')).not.toBeNull();
  });

  it('should render a submit button', () => {
    expect(el.querySelector('rw-button[type="submit"], button[type="submit"]')).not.toBeNull();
  });

  it('should return true from canDeactivate when form is clean', () => {
    const result = fixture.componentInstance.canDeactivate();
    expect(result).toBe(true);
  });

  it('should show empty state when cart is empty', async () => {
    isEmptySignal.set(true);
    await fixture.whenStable();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });
});
