import { firstValueFrom, Observable } from 'rxjs';
import { checkoutDeactivateGuard } from './checkout-deactivate.guard';

type CheckoutDeactivateComponent = Parameters<typeof checkoutDeactivateGuard>[0];

describe('checkoutDeactivateGuard', () => {
  const route = {} as Parameters<typeof checkoutDeactivateGuard>[1];
  const current = {} as Parameters<typeof checkoutDeactivateGuard>[2];
  const next = {} as Parameters<typeof checkoutDeactivateGuard>[3];

  it('wraps boolean results from the component in an observable', async () => {
    const stay = { canDeactivate: (): boolean => true } as CheckoutDeactivateComponent;
    const out = checkoutDeactivateGuard(stay, route, current, next) as Observable<boolean>;
    await expect(firstValueFrom(out)).resolves.toBe(true);

    const leave = { canDeactivate: (): boolean => false } as CheckoutDeactivateComponent;
    const outLeave = checkoutDeactivateGuard(leave, route, current, next) as Observable<boolean>;
    await expect(firstValueFrom(outLeave)).resolves.toBe(false);
  });

  it('returns observables from the component unchanged', async () => {
    const component = {
      canDeactivate: () =>
        new Observable<boolean>((observer) => {
          observer.next(true);
          observer.complete();
        }),
    } as CheckoutDeactivateComponent;

    const out = checkoutDeactivateGuard(component, route, current, next) as Observable<boolean>;
    await expect(firstValueFrom(out)).resolves.toBe(true);
  });
});
