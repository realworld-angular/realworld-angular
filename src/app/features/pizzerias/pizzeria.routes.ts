import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role/role.guard';
import { noPizzeriaGuard } from '../../core/guards/pizzeria/no-pizzeria.guard';
import { ROLES } from '../auth/role.model';

export const pizzeriasRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/pizzeria-list-page/pizzeria-list-page').then((m) => m.PizzeriaListPage),
  },
  {
    path: 'admin/pizzeria/new',
    canMatch: [roleGuard(ROLES.PIZZERIA_ADMIN), noPizzeriaGuard],
    loadComponent: () =>
      import('./pages/admin-pizzeria-new-page/admin-pizzeria-new-page').then((m) => m.AdminPizzeriaNewPage),
  },
  {
    path: 'admin/pizzeria',
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
