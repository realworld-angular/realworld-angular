import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanMatchFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { PizzeriaDetail } from '../models/pizzeria.models';



export const noPizzeriaGuard: CanMatchFn = () => {
  const httpClient = inject(HttpClient);
  const router = inject(Router);

  return httpClient.get<PizzeriaDetail | null>('/api/pizzerias/admin/pizzeria').pipe(
    map((pizzeria) => {
      if (pizzeria) {
        return router.createUrlTree(['/pizzerias/admin']);
      }
      return true;
    }),
    catchError(() => of(true)),
  );
};
