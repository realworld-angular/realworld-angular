import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, Route, UrlSegment } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { roleGuard } from './role.guard';
import { Auth } from '../../services/auth';
import { UrlTree } from '@angular/router';
import { User } from '../../models/user.model';

const userSignal = signal<User | null>(null);

const authStub = {
  user: userSignal,
};

describe('roleGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Auth, useValue: authStub }],
    });
    router = TestBed.inject(Router);
    userSignal.set(null);
  });

  it('should return UrlTree to /auth/login when no user is set', () => {
    const guard = roleGuard('CUSTOMER');
    const result = TestBed.runInInjectionContext(() => guard({ path: '' } as Route, [] as unknown as UrlSegment[]));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login');
  });

  it('should return true when user role matches', () => {
    userSignal.set({ id: '1', email: 'a@b.com', role: 'CUSTOMER', name: 'Test' });
    const guard = roleGuard('CUSTOMER');
    const result = TestBed.runInInjectionContext(() => guard({ path: '' } as Route, [] as unknown as UrlSegment[]));
    expect(result).toBe(true);
  });

  it('should return UrlTree to /unauthorized when role does not match', () => {
    userSignal.set({ id: '1', email: 'a@b.com', role: 'PIZZERIA_ADMIN', name: 'Admin' });
    const guard = roleGuard('CUSTOMER');
    const result = TestBed.runInInjectionContext(() => guard({ path: '' } as Route, [] as unknown as UrlSegment[]));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/unauthorized');
  });

  it('should return true when user role is one of multiple allowed roles', () => {
    userSignal.set({ id: '1', email: 'a@b.com', role: 'PIZZERIA_ADMIN', name: 'Admin' });
    const guard = roleGuard('CUSTOMER', 'PIZZERIA_ADMIN');
    const result = TestBed.runInInjectionContext(() => guard({ path: '' } as Route, [] as unknown as UrlSegment[]));
    expect(result).toBe(true);
  });
});
