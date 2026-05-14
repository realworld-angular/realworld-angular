import { CanDeactivateFn } from '@angular/router';
import { CheckoutPage } from '../../../features/checkout/pages/checkout-page/checkout-page';

export const checkoutDeactivateGuard: CanDeactivateFn<CheckoutPage> = (component) => {
  return component.canDeactivate();
};
