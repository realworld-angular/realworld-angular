import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OrderApi } from './order-api';
import { Order } from './order.models';

const mockOrder: Order = {
  id: 'order1',
  status: 'PENDING',
  total: 25.5,
  tipAmount: 0,
  scheduledAt: null,
  discountAmount: null,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  deliveryAddress: { street: '1 Main St', city: 'Rome', country: 'Italy' },
  billingAddress: null,
  notes: null,
  pizzeria: { id: 'p1', name: 'Roma', city: 'Rome', country: 'Italy' },
  client: { id: 'u1', name: 'Test User' },
  items: [],
};

describe('OrderApi', () => {
  let service: OrderApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    service = TestBed.inject(OrderApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should POST /api/orders for createOrder()', () => {
    const payload = {
      pizzeriaId: 'p1',
      deliveryAddress: { street: '1 Main St', city: 'Rome', country: 'Italy' },
      items: [{ pizzaId: 'pizza1', quantity: 2, selectedOptionIds: [] }],
    };
    service.createOrder(payload).subscribe();
    const req = httpTesting.expectOne('/api/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockOrder);
  });

  it('should PATCH /api/orders/:id/cancel for cancelOrder()', () => {
    service.cancelOrder('order1').subscribe();
    const req = httpTesting.expectOne('/api/orders/order1/cancel');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockOrder, status: 'CANCELLED' });
  });

  it('should PATCH /api/orders/:id/delivered for deliverOrder()', () => {
    service.deliverOrder('order1').subscribe();
    const req = httpTesting.expectOne('/api/orders/order1/delivered');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockOrder, status: 'DELIVERED' });
  });
});
