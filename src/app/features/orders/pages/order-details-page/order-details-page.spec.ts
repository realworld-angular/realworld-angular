import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OrderDetailPage } from './order-details-page';
import { Order } from '../../order.models';
import { environment } from '../../../../../environments/environment';

const mockOrder: Order = {
  id: 'order1',
  status: 'PENDING',
  total: 25.5,
  tipAmount: 0,
  scheduledAt: null,
  discountAmount: null,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  deliveryAddress: { street: '1 Main', city: 'Rome', country: 'Italy' },
  billingAddress: null,
  notes: null,
  pizzeria: { id: 'p1', name: 'Roma', city: 'Rome', country: 'Italy' },
  client: { id: 'u1', name: 'Test User' },
  items: [],
};

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor(
    public url: string,
    public init?: EventSourceInit,
  ) {
    FakeEventSource.instances.push(this);
  }

  emit(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }

  emitError(): void {
    this.onerror?.();
  }

  close(): void {
    this.closed = true;
  }
}

describe('OrderDetailPage', () => {
  let fixture: ComponentFixture<OrderDetailPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    FakeEventSource.instances = [];
    vi.stubGlobal('EventSource', FakeEventSource);

    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideRouter([])],
    });

    fixture = TestBed.createComponent(OrderDetailPage);
    fixture.componentRef.setInput('id', 'order1');
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.flushEffects();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    httpTesting.verify();
  });

  it('should show loading indicator before SSE message', () => {
    expect(el.querySelector('[aria-label="Loading order"]')).not.toBeNull();
  });

  it('should open an EventSource for the order subscription URL', () => {
    expect(FakeEventSource.instances.length).toBe(1);
    expect(FakeEventSource.instances[0].url).toBe(
      `${environment.apiBaseUrl}/api/orders/order1/subscribe`,
    );
  });

  it('should open EventSource with withCredentials true', () => {
    expect(FakeEventSource.instances[0].init?.withCredentials).toBe(true);
  });

  it('should render order content after SSE message is received', async () => {
    FakeEventSource.instances[0].emit(mockOrder);
    TestBed.flushEffects();
    await fixture.whenStable();
    expect(el.querySelector('[aria-label="Loading order"]')).toBeNull();
  });

  it('should show error state when SSE emits an error', async () => {
    FakeEventSource.instances[0].emitError();
    TestBed.flushEffects();
    await fixture.whenStable();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });

  it('should close EventSource on component destroy', () => {
    const es = FakeEventSource.instances[0];
    fixture.destroy();
    expect(es.closed).toBe(true);
  });

  it('should call PATCH /api/orders/:id/cancel when cancel button is clicked', async () => {
    FakeEventSource.instances[0].emit(mockOrder);
    TestBed.flushEffects();
    await fixture.whenStable();

    const cancelBtn = el.querySelector<HTMLElement>('rw-button')!;
    cancelBtn.click();
    const req = httpTesting.expectOne('/api/orders/order1/cancel');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockOrder, status: 'CANCELLED' });
  });
});
