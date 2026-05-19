import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { cartNotEmptyGuard } from './cart-not-empty.guard';
import { CartStore } from '../../cart/cart.store';

const isEmptySignal = signal(true);

const cartStoreStub = {
  isEmpty: isEmptySignal,
};

describe('cartNotEmptyGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: CartStore, useValue: cartStoreStub },
      ],
    });
    router = TestBed.inject(Router);
  });

  it('should return true when cart is not empty', () => {
    isEmptySignal.set(false);
    const result = TestBed.runInInjectionContext(() => cartNotEmptyGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('should redirect to /pizzerias when cart is empty', () => {
    isEmptySignal.set(true);
    const result = TestBed.runInInjectionContext(() => cartNotEmptyGuard({} as any, {} as any));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/pizzerias');
  });
});
