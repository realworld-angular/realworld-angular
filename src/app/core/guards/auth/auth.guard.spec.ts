import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, PartialMatchRouteSnapshot } from '@angular/router';
import { describe, it, expect, beforeEach, vi, type Mocked } from 'vitest';
import { authGuard, guestGuard } from './auth.guard';
import { Auth } from '../../services/auth';
import { UrlTree } from '@angular/router';

const authStub: Mocked<Pick<Auth, 'isAuthenticated'>> = {
  isAuthenticated: vi.fn(),
};

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Auth, useValue: authStub }],
    });
    router = TestBed.inject(Router);
  });

  it('should return true when user is authenticated', () => {
    authStub.isAuthenticated.mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({ path: '' }, [], {} as PartialMatchRouteSnapshot),
    );
    expect(result).toBe(true);
  });

  it('should return a UrlTree to /auth/login when not authenticated', () => {
    authStub.isAuthenticated.mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({ path: '' }, [], {} as PartialMatchRouteSnapshot),
    );
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login');
  });
});

describe('guestGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Auth, useValue: authStub }],
    });
    router = TestBed.inject(Router);
  });

  it('should return true when user is not authenticated', () => {
    authStub.isAuthenticated.mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() => guestGuard({}, [], {} as PartialMatchRouteSnapshot));
    expect(result).toBe(true);
  });

  it('should return a UrlTree to / when authenticated', () => {
    authStub.isAuthenticated.mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() => guestGuard({}, [], {} as PartialMatchRouteSnapshot));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });
});
