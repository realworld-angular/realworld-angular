import { TestBed } from '@angular/core/testing';
import { Route, UrlSegment, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { authGuard, guestGuard } from './auth.guard';
import { Auth } from '../../services/auth';
import { signal } from '@angular/core';

describe('authGuard', () => {

  function setup(isAuthenticated: boolean): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Auth,
          useValue: {
            isAuthenticated: signal(isAuthenticated),
            user: signal(null),
          },
        },
      ],
    });
  }

  it('should allow activation when authenticated', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => authGuard({} as Route, [] as UrlSegment[]));
    expect(result).toBe(true);
  });

  it('should redirect to /auth/login when not authenticated', () => {
    setup(false);
    const result = TestBed.runInInjectionContext(() => authGuard({} as Route, [] as UrlSegment[]));
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/auth/login');
  });
});

describe('guestGuard', () => {

  function setup(isAuthenticated: boolean): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Auth,
          useValue: {
            isAuthenticated: signal(isAuthenticated),
            user: signal(null),
          },
        },
      ],
    });
  }

  it('should allow activation when NOT authenticated (guest)', () => {
    setup(false);
    const result = TestBed.runInInjectionContext(() => guestGuard({} as Route, [] as UrlSegment[]));
    expect(result).toBe(true);
  });

  it('should redirect to / when already authenticated', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => guestGuard({} as Route, [] as UrlSegment[]));
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/');
  });
});
