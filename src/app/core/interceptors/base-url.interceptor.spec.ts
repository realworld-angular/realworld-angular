import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { baseUrlInterceptor } from './base-url.interceptor';
import { environment } from '../../../environments/environment';

describe('baseUrlInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([baseUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should prepend apiBaseUrl to requests starting with /api', () => {
    http.get('/api/pizzerias').subscribe();
    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/api/pizzerias`);
    expect(req.request.url).toBe(`${environment.apiBaseUrl}/api/pizzerias`);
    req.flush([]);
  });

  it('should prepend apiBaseUrl to nested /api paths', () => {
    http.get('/api/auth/me').subscribe();
    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/api/auth/me`);
    expect(req.request.url).toBe(`${environment.apiBaseUrl}/api/auth/me`);
    req.flush({});
  });

  it('should not modify requests that do not start with /api', () => {
    http.get('https://photon.komoot.io/api?q=rome').subscribe();
    const req = httpTesting.expectOne('https://photon.komoot.io/api?q=rome');
    expect(req.request.url).toBe('https://photon.komoot.io/api?q=rome');
    req.flush({});
  });
});
