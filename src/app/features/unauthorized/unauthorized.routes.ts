import { Routes } from '@angular/router';

export const unauthorizedRoutes: Routes = [
  {
    path: '',
    title: 'Unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized-page/unauthorized-page').then((m) => m.UnauthorizedPage),
  },
];
