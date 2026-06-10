import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Routes } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckoutDeliveryStep } from './checkout-delivery-step';
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

describe('CheckoutDeliveryStep', () => {
  let fixture: ComponentFixture<CheckoutDeliveryStep>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(testRoutes),
        CheckoutWizard,
        { provide: CartStore, useValue: cartStoreStub },
        { provide: OrderApi, useValue: orderApiStub },
      ],
    }).overrideComponent(CheckoutDeliveryStep, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(CheckoutDeliveryStep);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should render the delivery step heading', () => {
    expect(el.textContent).toContain('Delivery details');
  });

  it('should call wizard.validateStep on goNext', async () => {
    const wizard = TestBed.inject(CheckoutWizard);
    const spy = vi.spyOn(wizard, 'validateStep');
    (el.querySelector('rw-button') as HTMLElement).click();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('delivery');
  });
});
