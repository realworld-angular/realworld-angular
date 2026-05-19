import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Role } from '../../../features/auth/role.model';

export const roleGuard =
  (...roles: Role[]): CanMatchFn =>
  () => {
    const auth = inject(Auth);
    const router = inject(Router);
    const user = auth.user();

    if (!user) {
      return router.createUrlTree(['/auth/login']);
    }
    if (roles.includes(user.role)) {
      return true;
    }
    return router.createUrlTree(['/unauthorized']);
  };
