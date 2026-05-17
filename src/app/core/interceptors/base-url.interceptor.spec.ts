import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { baseUrlInterceptor } from './base-url.interceptor';

describe('baseUrlInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([baseUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should prefix /api requests with apiBaseUrl', () => {
    http.get('/api/articles').subscribe();
    const req = httpMock.expectOne('https://api.realworldangular.org/api/articles');
    req.flush({});
  });

  it('should not modify URLs that do not start with /api', () => {
    http.get('/assets/config.json').subscribe();
    const req = httpMock.expectOne('/assets/config.json');
    req.flush({});
  });

  it('should not modify absolute URLs', () => {
    http.get('https://photon.komoot.io/api/').subscribe();
    const req = httpMock.expectOne('https://photon.komoot.io/api/');
    req.flush({});
  });
});
