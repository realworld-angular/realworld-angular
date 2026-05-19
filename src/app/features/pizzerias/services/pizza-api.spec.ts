import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PizzaApi } from './pizza-api';
import { Pizza } from '../models/pizza.models';

const mockPizza: Pizza = {
  id: 'pizza1',
  name: 'Margherita',
  basePrice: 9.5,
  image: 'margherita.jpg',
  createdAt: '2024-01-01',
  toppings: [],
};

describe('PizzaApi', () => {
  let service: PizzaApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    service = TestBed.inject(PizzaApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should POST /api/admin/pizzeria/pizzas for createPizza()', () => {
    const data = { basePrice: 9.5, imageFilename: 'margherita.jpg', toppingIds: [] };
    service.createPizza(data).subscribe();
    const req = httpTesting.expectOne('/api/admin/pizzeria/pizzas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(mockPizza);
  });

  it('should PATCH /api/admin/pizzeria/pizzas/:id for updatePizza()', () => {
    const data = { basePrice: 11.0 };
    service.updatePizza('pizza1', data).subscribe();
    const req = httpTesting.expectOne('/api/admin/pizzeria/pizzas/pizza1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(data);
    req.flush(mockPizza);
  });

  it('should DELETE /api/admin/pizzeria/pizzas/:id for deletePizza()', () => {
    service.deletePizza('pizza1').subscribe();
    const req = httpTesting.expectOne('/api/admin/pizzeria/pizzas/pizza1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Deleted' });
  });
});
