import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OrdersListPage } from './order-list-page';
import { Auth } from '../../../../core/services/auth';
import { Page } from '../../../../core/models/pagination.model';
import { Order } from '../../order.models';
import { By } from '@angular/platform-browser';

const mockOrder: Order = {
  id: 'order1',
  status: 'PENDING',
  total: 25.5,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  deliveryAddress: { street: '1 Main', city: 'Rome', country: 'Italy' },
  billingAddress: null,
  notes: null,
  pizzeria: { id: 'p1', name: 'Roma', city: 'Rome', country: 'Italy' },
  client: { id: 'u1', name: 'Test User' },
  items: [],
};

function makePage(items: Order[], totalPages = 1): Page<Order> {
  return { items, total: items.length, page: 1, limit: 10, totalPages };
}

const authStub = { isAdmin: signal(false) };

describe('OrdersListPage', () => {
  let fixture: ComponentFixture<OrdersListPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Auth, useValue: authStub },
      ],
    }).overrideComponent(OrdersListPage, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(OrdersListPage);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should show loading indicator before response', () => {
    const req = httpTesting.expectOne((r) => r.url.includes('/api/orders'));
    expect(el.querySelector('[aria-label="Loading orders"]')).not.toBeNull();
    req.flush(makePage([]));
  });

  it('should render order rows after successful response', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/orders')).flush(makePage([mockOrder]));
    await fixture.whenStable();
    expect(el.querySelector('.order-row')).not.toBeNull();
  });

  it('should show empty state when no orders', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/orders')).flush(makePage([]));
    await fixture.whenStable();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });

  it('should show error callout on failure', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/orders')).flush('error', {
      status: 500, statusText: 'Server Error',
    });
    await fixture.whenStable();
    expect(el.querySelector('rw-callout')).not.toBeNull();
  });

  it('should display heading as My Orders for customer', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/orders')).flush(makePage([]));
    await fixture.whenStable();
    expect(el.querySelector('h1')!.textContent).toContain('My Orders');
  });

  it('should request page=1 initially', () => {
    const req = httpTesting.expectOne((r) => r.url.includes('/api/orders'));
    expect(req.request.url).toContain('page=1');
    req.flush(makePage([]));
  });

  it('should request new page when pagination changes', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/orders')).flush(makePage([mockOrder], 3));
    await fixture.whenStable();

    const pagination = fixture.debugElement.query(By.css('rw-pagination'));
    pagination.triggerEventHandler('pageChange', 2);
    TestBed.flushEffects();

    const req2 = httpTesting.expectOne((r) => r.url.includes('/api/orders'));
    expect(req2.request.url).toContain('page=2');
    req2.flush(makePage([mockOrder], 3));
  });
});
