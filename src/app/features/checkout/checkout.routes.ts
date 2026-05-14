import { Routes } from '@angular/router';
import { checkoutDeactivateGuard } from '../../core/guards/checkout-deactivate/checkout-deactivate.guard';
import { CheckoutPage } from './pages/checkout-page/checkout-page';

export const checkoutRoutes: Routes = [
  {
    path: '',
    canDeactivate: [checkoutDeactivateGuard],
    component: CheckoutPage,
  },
];
