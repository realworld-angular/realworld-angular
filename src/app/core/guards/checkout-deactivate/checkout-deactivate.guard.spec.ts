import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { checkoutDeactivateGuard } from './checkout-deactivate.guard';

type CheckoutDeactivateComponent = Parameters<typeof checkoutDeactivateGuard>[0];

describe('checkoutDeactivateGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const current = {} as RouterStateSnapshot;
  const next = {} as RouterStateSnapshot;

  it('wraps boolean results from the component in an observable', async () => {
    const stay = { requestLeaveCheckout: (): boolean => true } as CheckoutDeactivateComponent;
    const out = checkoutDeactivateGuard(stay, route, current, next) as Observable<boolean>;
    await expect(firstValueFrom(out)).resolves.toBe(true);

    const leave = { requestLeaveCheckout: (): boolean => false } as CheckoutDeactivateComponent;
    const outLeave = checkoutDeactivateGuard(leave, route, current, next) as Observable<boolean>;
    await expect(firstValueFrom(outLeave)).resolves.toBe(false);
  });

  it('returns observables from the component unchanged', async () => {
    const component = {
      requestLeaveCheckout: () =>
        new Observable<boolean>((observer) => {
          observer.next(true);
          observer.complete();
        }),
    } as CheckoutDeactivateComponent;

    const out = checkoutDeactivateGuard(component, route, current, next) as Observable<boolean>;
    await expect(firstValueFrom(out)).resolves.toBe(true);
  });
});
