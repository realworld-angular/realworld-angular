import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { CartStore } from '../../cart/cart.store';

export const cartNotEmptyGuard: CanMatchFn = () => {
  const cartStore = inject(CartStore);
  const router = inject(Router);

  if (!cartStore.isEmpty()) {
    return true;
  }
  return router.createUrlTree(['/pizzerias']);
};
