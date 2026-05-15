import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register-page/register-page').then((m) => m.RegisterPage),
  },
  {
    path: 'register-pizzeria',
    data: {
      registerAsPizzeriaOwner: true,
    },
    loadComponent: () => import('./pages/register-page/register-page').then((m) => m.RegisterPage),
  },
];
