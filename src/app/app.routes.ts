import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from './core/services/auth';
import { authGuard, guestGuard } from './core/guards/auth/auth.guard';
import { cartNotEmptyGuard } from './features/checkout/guards/cart-not-empty.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: (): string => {
      return inject(Auth).isAdmin() ? '/pizzerias/admin' : '/pizzerias';
    },
  },
  {
    path: 'pizzerias',
    loadChildren: () =>
      import('./features/pizzerias/pizzeria.routes').then((m) => m.pizzeriasRoutes),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
    canMatch: [guestGuard],
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.routes').then((m) => m.cartRoutes),
  },
  {
    path: 'checkout',
    loadChildren: () => import('./features/checkout/checkout.routes').then((m) => m.checkoutRoutes),
    canMatch: [authGuard, cartNotEmptyGuard],
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/order.routes').then((m) => m.ordersRoutes),
    canMatch: [authGuard],
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then((m) => m.profileRoutes),
    canMatch: [authGuard],
  },
  {
    path: 'unauthorized',
    loadChildren: () =>
      import('./features/unauthorized/unauthorized.routes').then((m) => m.unauthorizedRoutes),
  },
  {
    path: 'terms-and-conditions',
    loadChildren: () => import('./features/legal/legal.routes').then((m) => m.legalRoutes),
  },
  {
    path: '**',
    loadChildren: () =>
      import('./features/not-found/not-found.routes').then((m) => m.notFoundRoutes),
  },
];
