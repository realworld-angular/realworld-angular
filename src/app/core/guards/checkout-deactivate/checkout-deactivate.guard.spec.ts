import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { checkoutDeactivateGuard } from './checkout-deactivate.guard';
import { of } from 'rxjs';

const canDeactivateTrue = { canDeactivate: () => true };
const canDeactivateFalse = { canDeactivate: () => false };
const canDeactivateObservable = { canDeactivate: () => of(true) };

describe('checkoutDeactivateGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should return true when component.canDeactivate() returns true', () => {
    const result = TestBed.runInInjectionContext(() =>
      checkoutDeactivateGuard(canDeactivateTrue as any, {} as any, {} as any, {} as any),
    );
    expect(result).toBe(true);
  });

  it('should return false when component.canDeactivate() returns false', () => {
    const result = TestBed.runInInjectionContext(() =>
      checkoutDeactivateGuard(canDeactivateFalse as any, {} as any, {} as any, {} as any),
    );
    expect(result).toBe(false);
  });

  it('should forward an Observable returned by component.canDeactivate()', () => {
    const result = TestBed.runInInjectionContext(() =>
      checkoutDeactivateGuard(canDeactivateObservable as any, {} as any, {} as any, {} as any),
    );
    let value: boolean | undefined;
    (result as any).subscribe((v: boolean) => (value = v));
    expect(value).toBe(true);
  });
});
