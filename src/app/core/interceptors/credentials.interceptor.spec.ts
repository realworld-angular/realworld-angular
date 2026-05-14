import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { credentialsInterceptor } from './credentials.interceptor';

describe('credentialsInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add withCredentials: true to non-Photon requests', () => {
    http.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('should not set withCredentials for Photon API', () => {
    http.get('https://photon.komoot.io/api/').subscribe();
    const req = httpMock.expectOne('https://photon.komoot.io/api/');
    expect(req.request.withCredentials).toBe(false);
    req.flush({});
  });

  it('should preserve the original request URL', () => {
    http.post('/api/auth/login', { email: 'a@a.com' }).subscribe();
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.url).toBe('/api/auth/login');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });
});
