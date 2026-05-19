import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal, computed } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CartPage } from './cart-page';
import { CartStore, CartData } from '../../cart.store';
import { Auth } from '../../../../core/services/auth';

const mockCartData: CartData = {
  pizzeria: { id: 'p1', name: 'Roma', image: 'roma.jpg' },
  items: [
    {
      id: 'item1',
      pizza: { id: 'pizza1', name: 'Margherita', image: 'marg.jpg', basePrice: 9.5 },
      quantity: 2,
      size: null,
      extraToppings: [],
      totalPrice: 19,
    },
  ],
  total: 19,
};

const cartDataSignal = signal<CartData | null>(null);
const isEmptySignal = signal(true);
const isLoadingSignal = signal(false);

const cartStoreStub = {
  cart: cartDataSignal,
  isEmpty: isEmptySignal,
  isLoading: isLoadingSignal,
  itemCount: computed(() => cartDataSignal()?.items.reduce((s, i) => s + i.quantity, 0) ?? 0),
  pizzeria: signal(null),
  items: signal([]),
  clear: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
};

const authStub = { user: signal(null), isAuthenticated: signal(false) };

describe('CartPage', () => {
  let fixture: ComponentFixture<CartPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    cartDataSignal.set(null);
    isEmptySignal.set(true);
    isLoadingSignal.set(false);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: CartStore, useValue: cartStoreStub },
        { provide: Auth, useValue: authStub },
      ],
    }).overrideComponent(CartPage, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(CartPage);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should show empty state when cart is empty', () => {
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });

  it('should show loading spinner when cart is loading and no data yet', async () => {
    isEmptySignal.set(false);
    isLoadingSignal.set(true);
    await fixture.whenStable();
    expect(el.querySelector('[aria-label="Loading cart"]')).not.toBeNull();
  });

  it('should render cart items when cart has data', async () => {
    isEmptySignal.set(false);
    cartDataSignal.set(mockCartData);
    await fixture.whenStable();
    expect(el.textContent).toContain('Roma');
    expect(el.textContent).toContain('Margherita');
  });

  it('should show pizzeria name in the ordering from section', async () => {
    isEmptySignal.set(false);
    cartDataSignal.set(mockCartData);
    await fixture.whenStable();
    expect(el.textContent).toContain('Ordering from');
  });
});
