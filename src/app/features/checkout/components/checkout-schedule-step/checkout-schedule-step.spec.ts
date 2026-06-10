import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Routes } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckoutScheduleStep } from './checkout-schedule-step';
import { CheckoutWizard } from '../../services/checkout-wizard';
import { checkoutRoutes } from '../../checkout.routes';
import { CartStore, CartItem, CartData } from '../../../cart/cart.store';
import { OrderApi } from '../../../orders/services/order-api';

const cartStoreStub = {
  totalPrice: signal(0),
  pizzeria: signal<{ id: string } | null>(null),
  items: signal<CartItem[]>([]),
  cart: signal<CartData | null>(null),
  isEmpty: signal(true),
  clear: vi.fn(),
};

const orderApiStub = {
  createOrder: vi.fn(),
};

const testRoutes: Routes = [{ path: 'checkout', children: checkoutRoutes }];

describe('CheckoutScheduleStep', () => {
  let fixture: ComponentFixture<CheckoutScheduleStep>;
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
    }).overrideComponent(CheckoutScheduleStep, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(CheckoutScheduleStep);
    el = fixture.nativeElement;
    wizard = TestBed.inject(CheckoutWizard);
    await fixture.whenStable();
  });

  it('should render the schedule step heading', () => {
    expect(el.textContent).toContain('Delivery schedule');
  });

  it('should set activeStep back to delivery on goBack', () => {
    wizard.activeStep.set('schedule');
    (el.querySelectorAll('rw-button')[0] as HTMLElement).click();
    expect(wizard.activeStep()).toBe('delivery');
  });

  it('should call wizard.validateStep on goNext', async () => {
    const spy = vi.spyOn(wizard, 'validateStep');
    (el.querySelectorAll('rw-button')[1] as HTMLElement).click();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('schedule');
  });
});
