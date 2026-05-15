import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { CartStore } from '../../cart/cart.store';

export const cartNotEmptyGuard: CanMatchFn = () => {
  const cart = inject(CartStore);
  const router = inject(Router);

  if (!cart.isEmpty()) {
    return true;
  }
  return router.createUrlTree(['/pizzerias']);
};
