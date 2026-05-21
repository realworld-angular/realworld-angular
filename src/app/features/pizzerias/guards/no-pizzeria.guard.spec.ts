import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, UrlTree, Route, UrlSegment } from '@angular/router';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Observable } from 'rxjs';
import { noPizzeriaGuard } from './no-pizzeria.guard';
import { PizzeriaDetail } from '../models/pizzeria.models';

const mockPizzeria: PizzeriaDetail = {
  id: 'p1',
  name: 'Roma',
  city: 'Rome',
  country: 'Italy',
  image: 'roma.jpg',
  owner: { id: 'o1', name: 'Owner' },
  _count: { pizzas: 0 },
  createdAt: '2024-01-01',
  staff: [],
};

describe('noPizzeriaGuard', () => {
  let router: Router;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClientTesting()],
    });
    router = TestBed.inject(Router);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should redirect to /pizzerias/admin when pizzeria exists', () => {
    let result: unknown;
    (
      TestBed.runInInjectionContext(() =>
        noPizzeriaGuard({ path: '' } as Route, [] as unknown as UrlSegment[]),
      ) as Observable<boolean | UrlTree>
    ).subscribe((r) => (result = r));
    httpTesting.expectOne('/api/pizzerias/admin/pizzeria').flush(mockPizzeria);
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/pizzerias/admin');
  });

  it('should return true on HTTP 404 (no pizzeria for this admin)', () => {
    let result: unknown;
    (
      TestBed.runInInjectionContext(() =>
        noPizzeriaGuard({ path: '' } as Route, [] as unknown as UrlSegment[]),
      ) as Observable<boolean | UrlTree>
    ).subscribe((r) => (result = r));
    httpTesting.expectOne('/api/pizzerias/admin/pizzeria').flush('Not found', {
      status: 404,
      statusText: 'Not Found',
    });
    expect(result).toBe(true);
  });

  it('should return true on any other HTTP error', () => {
    let result: unknown;
    (
      TestBed.runInInjectionContext(() =>
        noPizzeriaGuard({ path: '' } as Route, [] as unknown as UrlSegment[]),
      ) as Observable<boolean | UrlTree>
    ).subscribe((r) => (result = r));
    httpTesting.expectOne('/api/pizzerias/admin/pizzeria').flush('error', {
      status: 500,
      statusText: 'Server Error',
    });
    expect(result).toBe(true);
  });
});
