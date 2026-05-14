import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Auth } from './auth';
import { User } from '../models/user.model';

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  role: 'CUSTOMER',
  name: 'TestUser',
};
const adminUser: User = {
  id: '2',
  email: 'admin@example.com',
  role: 'PIZZERIA_ADMIN',
  name: 'AdminUser',
};

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have no user initially', () => {
      expect(service.user()).toBeNull();
    });

    it('should not be authenticated initially', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('init()', () => {
    it('should set user and stop loading on success', () => {
      service.init().subscribe();
      const req = httpMock.expectOne('/api/auth/me');
      req.flush(mockUser);

      expect(service.user()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should set user to null and stop loading on error', () => {
      service.init().subscribe();
      const req = httpMock.expectOne('/api/auth/me');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should not clear a user established by register when /me returns 401 later', () => {
      service.init().subscribe();
      const meReq = httpMock.expectOne('/api/auth/me');

      service.register('newer@example.com', 'password123').subscribe();
      const regReq = httpMock.expectOne('/api/auth/register');
      regReq.flush(mockUser);

      expect(service.user()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);

      meReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(service.user()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('login()', () => {
    it('should set user on successful login', () => {
      service.login('test@example.com', 'password').subscribe();
      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password' });
      req.flush(mockUser);

      expect(service.user()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('logout()', () => {
    it('should clear user on successful logout', () => {
      // First set a user
      service.login('test@example.com', 'password').subscribe();
      httpMock.expectOne('/api/auth/login').flush(mockUser);

      service.logout().subscribe();
      const req = httpMock.expectOne('/api/auth/logout');
      expect(req.request.method).toBe('POST');
      req.flush({});

      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should clear user even on logout error', () => {
      service.login('test@example.com', 'password').subscribe();
      httpMock.expectOne('/api/auth/login').flush(mockUser);

      service.logout().subscribe();
      httpMock.expectOne('/api/auth/logout').flush('Error', { status: 500, statusText: 'Error' });

      expect(service.user()).toBeNull();
    });
  });

  describe('computed role flags', () => {
    it('isCustomer should be true for CUSTOMER role', () => {
      service.login('', '').subscribe();
      httpMock.expectOne('/api/auth/login').flush(mockUser);
      expect(service.isCustomer()).toBe(true);
      expect(service.isAdmin()).toBe(false);
    });

    it('isAdmin should be true for PIZZERIA_ADMIN role', () => {
      service.login('', '').subscribe();
      httpMock.expectOne('/api/auth/login').flush(adminUser);
      expect(service.isAdmin()).toBe(true);
      expect(service.isCustomer()).toBe(false);
    });
  });

  describe('register()', () => {
    it('should POST to register endpoint and set user like login', () => {
      service.register('new@example.com', 'password123').subscribe();
      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'new@example.com', password: 'password123' });
      req.flush(mockUser);

      expect(service.user()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('registerPizzeriaOwner()', () => {
    it('should POST to register-pizzeria-owner and set user like login', () => {
      service.registerPizzeriaOwner('owner@example.com', 'password123').subscribe();
      const req = httpMock.expectOne('/api/auth/register-pizzeria-owner');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'owner@example.com', password: 'password123' });
      req.flush(adminUser);

      expect(service.user()).toEqual(adminUser);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.isAdmin()).toBe(true);
    });
  });
});
