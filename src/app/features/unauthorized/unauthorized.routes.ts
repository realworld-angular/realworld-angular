import { Routes } from '@angular/router';

export const unauthorizedRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/unauthorized-page/unauthorized-page').then((m) => m.UnauthorizedPage),
  },
];
