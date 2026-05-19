import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PizzeriaApi } from './pizzeria-api';
import { PizzeriaDetail } from '../models/pizzeria.models';

const mockPizzeria: PizzeriaDetail = {
  id: 'p1',
  name: 'Roma',
  city: 'Rome',
  country: 'Italy',
  image: 'roma.jpg',
  owner: { id: 'o1', name: 'Owner' },
  _count: { pizzas: 3 },
  createdAt: '2024-01-01',
  staff: [],
};

describe('PizzeriaApi', () => {
  let service: PizzeriaApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    service = TestBed.inject(PizzeriaApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should GET /api/pizzerias/admin/pizzeria for getMyPizzeria()', () => {
    service.getMyPizzeria().subscribe();
    const req = httpTesting.expectOne('/api/pizzerias/admin/pizzeria');
    expect(req.request.method).toBe('GET');
    req.flush(mockPizzeria);
  });

  it('should POST /api/pizzerias for createPizzeria()', () => {
    const data = { city: 'Rome', country: 'Italy', imageFilename: 'roma.jpg' };
    service.createPizzeria(data).subscribe();
    const req = httpTesting.expectOne('/api/pizzerias');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(mockPizzeria);
  });

  it('should PATCH /api/pizzerias/admin/pizzeria for updateMyPizzeria()', () => {
    const data = { city: 'Naples' };
    service.updateMyPizzeria(data).subscribe();
    const req = httpTesting.expectOne('/api/pizzerias/admin/pizzeria');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(data);
    req.flush(mockPizzeria);
  });

  it('should DELETE /api/pizzerias/admin/pizzeria for deleteMyPizzeria()', () => {
    service.deleteMyPizzeria().subscribe();
    const req = httpTesting.expectOne('/api/pizzerias/admin/pizzeria');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Deleted' });
  });
});
