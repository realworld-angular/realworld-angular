import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Auth } from './auth';
import { User } from '../models/user.model';

const mockUser: User = { id: '1', email: 'test@example.com', role: 'CUSTOMER', name: 'Test User' };
const mockAdmin: User = { id: '2', email: 'admin@example.com', role: 'PIZZERIA_ADMIN', name: 'Admin User' };

describe('Auth', () => {
  let service: Auth;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should have null user initially', () => {
    expect(service.user()).toBeNull();
  });

  it('should have isAuthenticated false initially', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  describe('init()', () => {
    it('should set user signal on success', () => {
      service.init().subscribe();
      const req = httpTesting.expectOne('/api/auth/me');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
      expect(service.user()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should keep user null on error', () => {
      service.init().subscribe();
      const req = httpTesting.expectOne('/api/auth/me');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('login()', () => {
    it('should POST credentials and update user signal', () => {
      service.login('test@example.com', 'password').subscribe();
      const req = httpTesting.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password' });
      req.flush(mockUser);
      expect(service.user()).toEqual(mockUser);
    });
  });

  describe('register()', () => {
    it('should POST credentials and update user signal', () => {
      service.register('test@example.com', 'password').subscribe();
      const req = httpTesting.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password' });
      req.flush(mockUser);
      expect(service.user()).toEqual(mockUser);
    });
  });

  describe('registerPizzeriaOwner()', () => {
    it('should POST to register-pizzeria-owner and update user signal', () => {
      service.registerPizzeriaOwner('owner@example.com', 'password').subscribe();
      const req = httpTesting.expectOne('/api/auth/register-pizzeria-owner');
      expect(req.request.method).toBe('POST');
      req.flush(mockAdmin);
      expect(service.user()).toEqual(mockAdmin);
    });
  });

  describe('logout()', () => {
    it('should POST to logout endpoint', () => {
      service.logout().subscribe();
      const req = httpTesting.expectOne('/api/auth/logout');
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('computed signals', () => {
    it('isCustomer should be true when role is CUSTOMER', () => {
      service.user.set(mockUser);
      expect(service.isCustomer()).toBe(true);
      expect(service.isAdmin()).toBe(false);
    });

    it('isAdmin should be true when role is PIZZERIA_ADMIN', () => {
      service.user.set(mockAdmin);
      expect(service.isAdmin()).toBe(true);
      expect(service.isCustomer()).toBe(false);
    });

    it('isAuthenticated should reflect user signal', () => {
      service.user.set(mockUser);
      expect(service.isAuthenticated()).toBe(true);
      service.user.set(null);
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
