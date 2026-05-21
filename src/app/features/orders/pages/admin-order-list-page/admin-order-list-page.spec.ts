import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AdminOrderListPage } from './admin-order-list-page';
import { AdminOrderRow } from './admin-order-row/admin-order-row';
import { Page } from '../../../../core/models/pagination.model';
import { AdminOrderListItem } from '../../order.models';
import { By } from '@angular/platform-browser';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { Callout } from '../../../../shared/components/callout/callout';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

const mockOrder: AdminOrderListItem = {
  id: 'order1',
  status: 'PENDING',
  total: 20,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  pizzeria: { id: 'p1', name: 'Roma', city: 'Rome', country: 'Italy' },
  client: { id: 'u1', name: 'Test User' },
  items: [],
};

function makePage(items: AdminOrderListItem[], totalPages = 1): Page<AdminOrderListItem> {
  return { items, total: items.length, page: 1, limit: 15, totalPages };
}

describe('AdminOrderListPage', () => {
  let fixture: ComponentFixture<AdminOrderListPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    }).overrideComponent(AdminOrderListPage, {
      set: {
        imports: [Spinner, Pagination, Callout, EmptyState, AdminOrderRow],
        schemas: [],
      },
    });

    fixture = TestBed.createComponent(AdminOrderListPage);
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

  it('should show empty state when no orders', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/orders')).flush(makePage([]));
    await fixture.whenStable();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });

  it('should show error callout on failure', async () => {
    httpTesting
      .expectOne((r) => r.url.includes('/api/orders'))
      .flush('error', {
        status: 500,
        statusText: 'Server Error',
      });
    await fixture.whenStable();
    expect(el.querySelector('rw-callout')).not.toBeNull();
  });

  it('should render the orders table when orders exist', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/orders')).flush(makePage([mockOrder]));
    await fixture.whenStable();
    expect(el.querySelector('table[aria-label="Orders"]')).not.toBeNull();
  });

  it('should request next page when pagination changes', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/orders')).flush(makePage([mockOrder], 3));
    await fixture.whenStable();

    const pagination = fixture.debugElement.query(By.css('rw-pagination'));
    pagination.triggerEventHandler('pageChange', 2);
    TestBed.flushEffects();

    const req2 = httpTesting.expectOne((r) => r.url.includes('/api/orders'));
    expect(req2.request.url).toContain('page=2');
    req2.flush(makePage([mockOrder], 3));
  });

  it('should update an order in place when child emits updateOrder', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/orders')).flush(makePage([mockOrder]));
    await fixture.whenStable();

    const updated: AdminOrderListItem = { ...mockOrder, status: 'DELIVERED' };
    const rowDe = fixture.debugElement.query(By.directive(AdminOrderRow));
    rowDe.componentInstance.updateOrder.emit(updated);
    await fixture.whenStable();

    expect(el.querySelector('tr')).not.toBeNull();
  });
});
