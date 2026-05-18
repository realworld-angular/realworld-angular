import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role.guard';
import { noPizzeriaGuard } from './guards/no-pizzeria.guard';
import { ROLES } from '../auth/role.model';

export const pizzeriasRoutes: Routes = [
  {
    path: '',
    title: 'Pizzerias',
    loadComponent: () =>
      import('./pages/pizzeria-list-page/pizzeria-list-page').then((m) => m.PizzeriaListPage),
  },
  {
    path: 'admin/new',
    title: 'Create Pizzeria',
    canMatch: [roleGuard(ROLES.PIZZERIA_ADMIN), noPizzeriaGuard],
    loadComponent: () =>
      import('./pages/admin-pizzeria-form-page/admin-pizzeria-form-page').then((m) => m.AdminPizzeriaFormPage),
  },
  {
    path: 'admin',
    canMatch: [roleGuard(ROLES.PIZZERIA_ADMIN)],
    loadComponent: () =>
      import('./pages/admin-pizzeria-details-page/admin-pizzeria-details-page').then((m) => m.AdminPizzeriaDetailsPage),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pizzas',
      },
      {
        path: 'pizzas',
        title: 'Manage Pizzas',
        loadComponent: () =>
          import('./pages/admin-pizza-list-page/admin-pizza-list-page').then((m) => m.AdminPizzaListPage),
      },
      {
        path: 'configuration',
        loadComponent: () =>
          import('./pages/admin-pizzeria-configuration-page/admin-pizzeria-configuration-page').then(
            (m) => m.AdminPizzeriaConfigurationPage,
          ),
      },
    ],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/pizzeria-details-page/pizzeria-details-page').then((m) => m.PizzeriaDetailsPage),
  },
];
