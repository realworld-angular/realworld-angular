import { TestBed } from '@angular/core/testing';
import { provideRouter, Routes, Router } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckoutWizard } from './checkout-wizard';
import { checkoutRoutes } from '../checkout.routes';
import { CartStore } from '../../cart/cart.store';
import { OrderApi } from '../../orders/order-api';

const cartStoreStub = {
  totalPrice: signal(0),
  pizzeria: signal<{ id: string } | null>(null),
  items: signal([] as any[]),
  cart: signal<any>(null),
  isEmpty: signal(true),
  clear: vi.fn(),
};

const orderApiStub = {
  createOrder: vi.fn(),
};

const testRoutes: Routes = [{ path: 'checkout', children: checkoutRoutes }];

describe('CheckoutWizard', () => {
  let service: CheckoutWizard;
  let router: Router;

  beforeEach(async () => {
    cartStoreStub.totalPrice.set(0);
    cartStoreStub.pizzeria.set(null);
    cartStoreStub.items.set([]);
    cartStoreStub.cart.set(null);

    TestBed.configureTestingModule({
      providers: [
        provideRouter(testRoutes),
        CheckoutWizard,
        { provide: CartStore, useValue: cartStoreStub },
        { provide: OrderApi, useValue: orderApiStub },
      ],
    });
    service = TestBed.inject(CheckoutWizard);
    router = TestBed.inject(Router);
    await router.navigateByUrl('/checkout/delivery');
  });

  it('should start on delivery step', () => {
    expect(service.activeStep()).toBe('delivery');
  });

  it('should have all step statuses as null initially', () => {
    const status = service.stepStatus();
    expect(status.delivery).toBeNull();
    expect(status.schedule).toBeNull();
    expect(status.review).toBeNull();
  });

  it('should not be submitted initially', () => {
    expect(service.submitted()).toBe(false);
  });

  describe('tipAmount', () => {
    it('should be 0 when tip type is none', () => {
      expect(service.tipAmount()).toBe(0);
    });

    it('should compute 10% of total when tip type is ten', () => {
      cartStoreStub.totalPrice.set(20);
      service.checkoutForm.tip.type().value.set('ten');
      TestBed.flushEffects();
      expect(service.tipAmount()).toBe(2);
    });

    it('should compute 15% of total when tip type is fifteen', () => {
      cartStoreStub.totalPrice.set(10);
      service.checkoutForm.tip.type().value.set('fifteen');
      TestBed.flushEffects();
      expect(service.tipAmount()).toBe(1.5);
    });

    it('should compute 20% of total when tip type is twenty', () => {
      cartStoreStub.totalPrice.set(50);
      service.checkoutForm.tip.type().value.set('twenty');
      TestBed.flushEffects();
      expect(service.tipAmount()).toBe(10);
    });

    it('should return custom amount when tip type is custom', () => {
      service.checkoutForm.tip.type().value.set('custom');
      service.checkoutForm.tip.customAmount().value.set(3.5);
      TestBed.flushEffects();
      expect(service.tipAmount()).toBe(3.5);
    });
  });

  describe('totalWithTip', () => {
    it('should equal totalPrice when no tip', () => {
      cartStoreStub.totalPrice.set(30);
      expect(service.totalWithTip()).toBe(30);
    });

    it('should add tip amount to total price', () => {
      cartStoreStub.totalPrice.set(20);
      service.checkoutForm.tip.type().value.set('ten');
      TestBed.flushEffects();
      expect(service.totalWithTip()).toBe(22);
    });
  });

  describe('isStepValid', () => {
    it('should return false for delivery when street is empty', () => {
      TestBed.flushEffects();
      expect(service.isStepValid('delivery')).toBe(false);
    });

    it('should return true for delivery when required fields are filled', () => {
      service.checkoutForm.delivery.street().value.set('123 Main St');
      service.checkoutForm.delivery.location().value.set({ city: 'Rome', country: 'Italy' });
      TestBed.flushEffects();
      expect(service.isStepValid('delivery')).toBe(true);
    });

    it('should return true for schedule when type is asap', () => {
      expect(service.isStepValid('schedule')).toBe(true);
    });
  });

  describe('validateStep', () => {
    it('should validate and navigate on valid delivery', async () => {
      service.checkoutForm.delivery.street().value.set('123 Main St');
      service.checkoutForm.delivery.location().value.set({ city: 'Rome', country: 'Italy' });
      TestBed.flushEffects();

      await service.validateStep('delivery');
      expect(service.stepStatus().delivery).toBe('success');
    });

    it('should not navigate on invalid delivery', async () => {
      await service.validateStep('delivery');
      expect(service.stepStatus().delivery).not.toBe('success');
      expect(service.activeStep()).toBe('delivery');
    });

    it('should validate and navigate on valid schedule (asap)', async () => {
      await service.validateStep('schedule');
      expect(service.stepStatus().schedule).toBe('success');
    });
  });

  describe('billing fields effect', () => {
    it('should clear billing fields when useSameAsBilling is enabled', () => {
      service.checkoutForm.delivery.billingLocation().value.set({ city: 'Milan', country: 'Italy' });
      service.checkoutForm.delivery.billingStreet().value.set('456 Oak Ave');
      TestBed.flushEffects();

      service.checkoutForm.delivery.useSameAsBilling().value.set(false);
      TestBed.flushEffects();
      service.checkoutForm.delivery.useSameAsBilling().value.set(true);
      TestBed.flushEffects();

      expect(service.checkoutForm.delivery.billingLocation().value()).toBeNull();
      expect(service.checkoutForm.delivery.billingStreet().value()).toBe('');
    });
  });
});
