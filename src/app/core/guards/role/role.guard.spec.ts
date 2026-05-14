import { TestBed } from '@angular/core/testing';
import { Route, UrlSegment, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { roleGuard } from './role.guard';
import { Auth } from '../../services/auth';
import { signal } from '@angular/core';
import { User } from '../../models/user.model';

function setup(user: User | null): void {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: Auth,
        useValue: {
          isAuthenticated: signal(user !== null),
          user: signal(user),
        },
      },
    ],
  });
}

describe('roleGuard', () => {
  it('should redirect to /auth/login when no user', () => {
    setup(null);
    const guard = roleGuard('CUSTOMER');
    const result = TestBed.runInInjectionContext(() => guard({} as Route, [] as UrlSegment[]));
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/auth/login');
  });

  it('should allow access when user has required role', () => {
    setup({
      id: '1',
      email: 'a@a.com',
      role: 'CUSTOMER',
      name: 'User',
    });
    const guard = roleGuard('CUSTOMER');
    const result = TestBed.runInInjectionContext(() => guard({} as Route, [] as UrlSegment[]));
    expect(result).toBe(true);
  });

  it('should redirect to /unauthorized when user has wrong role', () => {
    setup({
      id: '1',
      email: 'a@a.com',
      role: 'CUSTOMER',
      name: 'User',
    });
    const guard = roleGuard('PIZZERIA_ADMIN');
    const result = TestBed.runInInjectionContext(() => guard({} as Route, [] as UrlSegment[]));
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/unauthorized');
  });

  it('should allow access if user has one of multiple required roles', () => {
    setup({
      id: '1',
      email: 'a@a.com',
      role: 'PIZZERIA_ADMIN',
      name: 'Admin',
    });
    const guard = roleGuard('CUSTOMER', 'PIZZERIA_ADMIN');
    const result = TestBed.runInInjectionContext(() => guard({} as Route, [] as UrlSegment[]));
    expect(result).toBe(true);
  });
});
