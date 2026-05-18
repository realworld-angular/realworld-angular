import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    title: 'Register',
    loadComponent: () => import('./pages/register-page/register-page').then((m) => m.RegisterPage),
  },
  {
    path: 'register-pizzeria',
    title: 'Create your pizzeria account',
    data: {
      registerAsPizzeriaOwner: true,
    },
    loadComponent: () => import('./pages/register-page/register-page').then((m) => m.RegisterPage),
  },
];
