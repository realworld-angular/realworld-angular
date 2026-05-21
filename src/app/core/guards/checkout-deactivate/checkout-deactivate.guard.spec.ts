import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { checkoutDeactivateGuard } from './checkout-deactivate.guard';
import { CheckoutPage } from '../../../features/checkout/pages/checkout-page/checkout-page';
import { Observable, of } from 'rxjs';

function canDeactivateResult(value: boolean): CheckoutPage {
  return { canDeactivate: () => value } as unknown as CheckoutPage;
}

function canDeactivateObservable(): CheckoutPage {
  return { canDeactivate: (): Observable<boolean> => of(true) } as unknown as CheckoutPage;
}

const routeStub = {} as ActivatedRouteSnapshot;
const stateStub = {} as RouterStateSnapshot;

describe('checkoutDeactivateGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should return true when component.canDeactivate() returns true', () => {
    const result = TestBed.runInInjectionContext(() =>
      checkoutDeactivateGuard(canDeactivateResult(true), routeStub, stateStub, stateStub),
    );
    expect(result).toBe(true);
  });

  it('should return false when component.canDeactivate() returns false', () => {
    const result = TestBed.runInInjectionContext(() =>
      checkoutDeactivateGuard(canDeactivateResult(false), routeStub, stateStub, stateStub),
    );
    expect(result).toBe(false);
  });

  it('should forward an Observable returned by component.canDeactivate()', () => {
    const result = TestBed.runInInjectionContext(() =>
      checkoutDeactivateGuard(canDeactivateObservable(), routeStub, stateStub, stateStub),
    );
    let value: boolean | undefined;
    if (result instanceof Observable) {
      result.subscribe((v) => (value = v as boolean));
    }
    expect(value).toBe(true);
  });
});
