import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  GuardResult,
  MaybeAsync,
  PartialMatchRouteSnapshot,
  provideRouter,
  Router,
  RouterOutlet,
  Routes,
  UrlTree,
} from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkoutStepGuard } from './checkout-step.guard';
import { CheckoutWizard } from '../services/checkout-wizard';
import { CartStore, CartItem, CartData } from '../../cart/cart.store';
import { OrderApi } from '../../orders/services/order-api';

@Component({ template: '<router-outlet />', imports: [RouterOutlet], changeDetection: ChangeDetectionStrategy.OnPush })
class CheckoutShell {}

const mockCartData: CartData = {
  pizzeria: { id: 'p1', name: 'Roma', image: 'roma.jpg' },
  items: [],
  total: 0,
};

const cartStoreStub = {
  totalPrice: signal(0),
  pizzeria: signal<{ id: string } | null>({ id: 'p1' }),
  items: signal<CartItem[]>([]),
  cart: signal<CartData | null>(mockCartData),
  isEmpty: signal(false),
  clear: vi.fn(),
};

const orderApiStub = {
  createOrder: vi.fn(),
};

const testCheckoutRoutes: Routes = [
  {
    path: 'checkout',
    children: [
      {
        path: '',
        component: CheckoutShell,
        children: [
          { path: '', redirectTo: 'delivery', pathMatch: 'full' },
          {
            path: 'delivery',
            loadComponent: () =>
              import('../components/checkout-delivery-step/checkout-delivery-step').then(
                (m) => m.CheckoutDeliveryStep,
              ),
            canMatch: [checkoutStepGuard('delivery')],
          },
          {
            path: 'schedule',
            loadComponent: () =>
              import('../components/checkout-schedule-step/checkout-schedule-step').then(
                (m) => m.CheckoutScheduleStep,
              ),
            canMatch: [checkoutStepGuard('schedule')],
          },
          {
            path: 'review',
            loadComponent: () =>
              import('../components/checkout-review-step/checkout-review-step').then(
                (m) => m.CheckoutReviewStep,
              ),
            canMatch: [checkoutStepGuard('review')],
          },
        ],
      },
    ],
  },
];

describe('checkoutStepGuard', () => {
  let router: Router;
  let wizard: CheckoutWizard;

  function runGuard(step: 'delivery' | 'schedule' | 'review'): MaybeAsync<GuardResult> {
    return TestBed.runInInjectionContext(() =>
      checkoutStepGuard(step)({}, [], {} as PartialMatchRouteSnapshot),
    );
  }

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
    const result = runGuard('delivery');
    expect(result).toBe(true);
    expect(wizard.activeStep()).toBe('delivery');
  });

  it('should redirect schedule to delivery when delivery is invalid', async () => {
    const result = runGuard('schedule');
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/checkout/delivery');
  });

  it('should allow schedule when delivery is valid', async () => {
    wizard.checkoutForm.delivery.street().value.set('123 Main St');
    wizard.checkoutForm.delivery.location().value.set({ city: 'Rome', country: 'Italy' });
    TestBed.flushEffects();

    const result = runGuard('schedule');
    expect(result).toBe(true);
    expect(wizard.activeStep()).toBe('schedule');
  });

  it('should redirect review to delivery when delivery is invalid', () => {
    const result = runGuard('review');
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/checkout/delivery');
  });

  it('should redirect review to schedule when only schedule is invalid', async () => {
    wizard.checkoutForm.delivery.street().value.set('123 Main St');
    wizard.checkoutForm.delivery.location().value.set({ city: 'Rome', country: 'Italy' });
    wizard.checkoutForm.schedule.type().value.set('scheduled');
    TestBed.flushEffects();

    const result = runGuard('review');
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/checkout/schedule');
  });

  it('should block direct navigation to review via router', async () => {
    await router.navigateByUrl('/checkout/review');
    expect(router.url).toBe('/checkout/delivery');
  });

  it('should allow review when prior steps are valid', () => {
    wizard.checkoutForm.delivery.street().value.set('123 Main St');
    wizard.checkoutForm.delivery.location().value.set({ city: 'Rome', country: 'Italy' });
    TestBed.flushEffects();

    const result = runGuard('review');
    expect(result).toBe(true);
    expect(wizard.activeStep()).toBe('review');
  });
});
