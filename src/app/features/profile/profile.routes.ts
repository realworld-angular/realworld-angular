import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth.guard';

export const profileRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile-page/profile-page').then((m) => m.ProfilePage),
    title: 'My Profile',
  },
];
