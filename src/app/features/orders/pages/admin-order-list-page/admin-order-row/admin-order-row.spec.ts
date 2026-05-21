import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Subject } from 'rxjs';
import { AdminOrderRow } from './admin-order-row';
import { AdminOrderListItem } from '../../../order.models';
import { Dialog } from '@angular/cdk/dialog';

const mockOrder: AdminOrderListItem = {
  id: 'order1',
  status: 'PENDING',
  total: 20,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  pizzeria: { id: 'p1', name: 'Roma', city: 'Rome', country: 'Italy' },
  client: { id: 'u1', name: 'Test User' },
  items: [
    {
      id: 'i1',
      quantity: 2,
      unitPrice: 10,
      selectedOptions: [],
      pizza: { id: 'p1', name: 'Margherita' },
    },
  ],
};

function createDialogStub(): { open: ReturnType<typeof vi.fn>; closed$: Subject<string | null> } {
  const closed$ = new Subject<string | null>();
  return { open: vi.fn(() => ({ closed: closed$ })), closed$ };
}

describe('AdminOrderRow', () => {
  let fixture: ComponentFixture<AdminOrderRow>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;
  let dialogStub: ReturnType<typeof createDialogStub>;

  beforeEach(() => {
    dialogStub = createDialogStub();
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), { provide: Dialog, useValue: dialogStub }],
    }).overrideComponent(AdminOrderRow, { set: { schemas: [NO_ERRORS_SCHEMA] } });
    fixture = TestBed.createComponent(AdminOrderRow);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('order', mockOrder);
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should render order date and total', () => {
    expect(el.textContent).toContain('€20.00');
  });

  it('should show deliver and cancel buttons for PENDING order', () => {
    expect(el.querySelector('[aria-label*="delivered"]')).not.toBeNull();
    expect(el.querySelector('[aria-label*="cancel"]')).not.toBeNull();
  });

  it('should hide action buttons for CANCELLED order', async () => {
    fixture.componentRef.setInput('order', { ...mockOrder, status: 'CANCELLED' });
    await fixture.whenStable();
    expect(el.querySelector('[aria-label*="delivered"]')).toBeNull();
    expect(el.querySelector('[aria-label*="cancel"]')).toBeNull();
  });

  it('should hide cancel button for DELIVERED order', async () => {
    fixture.componentRef.setInput('order', { ...mockOrder, status: 'DELIVERED' });
    await fixture.whenStable();
    expect(el.querySelector('[aria-label*="delivered"]')).toBeNull();
    expect(el.querySelector('[aria-label*="cancel"]')).toBeNull();
  });

  it('should open confirm dialog on deliver click', () => {
    const deliverBtn = el.querySelector<HTMLButtonElement>('[aria-label*="delivered"]')!;
    deliverBtn.click();
    expect(dialogStub.open).toHaveBeenCalled();
  });

  it('should call deliver API when confirmed and emit updateOrder', () => {
    const updated: AdminOrderListItem[] = [];
    fixture.componentInstance.updateOrder.subscribe((o) => updated.push(o));

    fixture.componentInstance.promptDeliverOrder();
    dialogStub.closed$.next('confirmed');

    const req = httpTesting.expectOne('/api/orders/order1/delivered');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockOrder, status: 'DELIVERED' });

    expect(updated.length).toBe(1);
    expect(updated[0].status).toBe('DELIVERED');
  });

  it('should call cancel API when confirmed and emit updateOrder', () => {
    const updated: AdminOrderListItem[] = [];
    fixture.componentInstance.updateOrder.subscribe((o) => updated.push(o));

    fixture.componentInstance.promptCancelOrder();
    dialogStub.closed$.next('confirmed');

    const req = httpTesting.expectOne('/api/orders/order1/cancel');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockOrder, status: 'CANCELLED' });

    expect(updated.length).toBe(1);
    expect(updated[0].status).toBe('CANCELLED');
  });

  it('should emit showFeedback on API error', () => {
    const feedback: { variant: string; message: string }[] = [];
    fixture.componentInstance.showFeedback.subscribe((f) => feedback.push(f));

    fixture.componentInstance.promptDeliverOrder();
    dialogStub.closed$.next('confirmed');

    const req = httpTesting.expectOne('/api/orders/order1/delivered');
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(feedback.length).toBe(1);
    expect(feedback[0].variant).toBe('error');
  });

  it('should not call API when cancel dialog is dismissed', () => {
    fixture.componentInstance.promptCancelOrder();
    dialogStub.closed$.next('dismissed');
    httpTesting.expectNone(() => true);
  });
});
