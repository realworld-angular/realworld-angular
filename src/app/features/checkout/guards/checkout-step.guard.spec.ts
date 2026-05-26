import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkoutStepGuard } from './checkout-step.guard';
import { CheckoutWizard } from '../services/checkout-wizard';
import { checkoutRoutes } from '../checkout.routes';
import { CartStore } from '../../cart/cart.store';
import { OrderApi } from '../../orders/order-api';

const cartStoreStub = {
  totalPrice: signal(0),
  pizzeria: signal<{ id: string } | null>(null),
  items: signal([] as any[]),
  cart: signal<any>(null),
  isEmpty: signal(false),
  clear: vi.fn(),
};

const orderApiStub = {
  createOrder: vi.fn(),
};

const testCheckoutRoutes: Routes = [{ path: 'checkout', children: checkoutRoutes }];

describe('checkoutStepGuard', () => {
  let router: Router;
  let wizard: CheckoutWizard;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(testCheckoutRoutes),
        CheckoutWizard,
        { provide: CartStore, useValue: cartStoreStub },
        { provide: OrderApi, useValue: orderApiStub },
      ],
    });
    router = TestBed.inject(Router);
    wizard = TestBed.inject(CheckoutWizard);
    await router.navigateByUrl('/checkout/delivery');
  });

  it('should allow delivery when prerequisites are empty', () => {
    const result = TestBed.runInInjectionContext(() => checkoutStepGuard('delivery')({}, []));
    expect(result).toBe(true);
    expect(wizard.activeStep()).toBe('delivery');
  });

  it('should redirect schedule to delivery when delivery is invalid', async () => {
    const result = TestBed.runInInjectionContext(() =>
      checkoutStepGuard('schedule')({}, []),
    );
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/checkout/delivery');
  });

  it('should allow schedule when delivery is valid', async () => {
    wizard.checkoutForm.delivery.street().value.set('123 Main St');
    wizard.checkoutForm.delivery.location().value.set({ city: 'Rome', country: 'Italy' });
    TestBed.flushEffects();

    const result = TestBed.runInInjectionContext(() =>
      checkoutStepGuard('schedule')({}, []),
    );
    expect(result).toBe(true);
    expect(wizard.activeStep()).toBe('schedule');
  });

  it('should redirect review to delivery when delivery is invalid', () => {
    const result = TestBed.runInInjectionContext(() =>
      checkoutStepGuard('review')({}, []),
    );
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/checkout/delivery');
  });

  it('should redirect review to schedule when only schedule is invalid', async () => {
    wizard.checkoutForm.delivery.street().value.set('123 Main St');
    wizard.checkoutForm.delivery.location().value.set({ city: 'Rome', country: 'Italy' });
    TestBed.flushEffects();

    const result = TestBed.runInInjectionContext(() =>
      checkoutStepGuard('review')({}, []),
    );
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/checkout/schedule');
  });

  it('should block direct navigation to review via router', async () => {
    await router.navigateByUrl('/checkout/review');
    expect(router.url).toBe('/checkout/delivery');
  });

  it('should allow direct navigation to review when prior steps are valid', async () => {
    wizard.checkoutForm.delivery.street().value.set('123 Main St');
    wizard.checkoutForm.delivery.location().value.set({ city: 'Rome', country: 'Italy' });
    TestBed.flushEffects();
    await router.navigateByUrl('/checkout/review');
    expect(router.url).toBe('/checkout/review');
    expect(wizard.activeStep()).toBe('review');
  });
});
