import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { PizzeriaApi } from '../services/pizzeria-api';

export const noPizzeriaGuard: CanMatchFn = () => {
  const pizzeriaApi = inject(PizzeriaApi);
  const router = inject(Router);

  return pizzeriaApi.getMyPizzeria().pipe(
    map((pizzeria) => {
      if (pizzeria) {
        return router.createUrlTree(['/pizzerias/admin']);
      }
      return true;
    }),
    catchError(() => of(true)),
  );
};
