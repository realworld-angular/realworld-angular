import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PizzeriaListPage } from './pizzeria-list-page';
import { Page } from '../../../../core/models/pagination.model';
import { PizzeriaSummary } from '../../models/pizzeria.models';
import { By } from '@angular/platform-browser';

const mockPizzeria: PizzeriaSummary = {
  id: '1',
  name: 'Pizza Roma',
  city: 'Rome',
  country: 'Italy',
  image: 'roma.jpg',
  owner: { id: 'o1', name: 'Owner' },
  _count: { pizzas: 5 },
  createdAt: '2024-01-01',
};

function makePage(items: PizzeriaSummary[], totalPages = 1): Page<PizzeriaSummary> {
  return { items, total: items.length, page: 1, limit: 12, totalPages };
}

describe('PizzeriaListPage', () => {
  let fixture: ComponentFixture<PizzeriaListPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideRouter([])],
    }).overrideComponent(PizzeriaListPage, {
      set: { schemas: [NO_ERRORS_SCHEMA] },
    });

    fixture = TestBed.createComponent(PizzeriaListPage);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should show loading indicator before response arrives', () => {
    expect(el.querySelector('[aria-label="Loading pizzerias"]')).not.toBeNull();
    httpTesting.expectOne((r) => r.url.includes('/api/pizzerias')).flush(makePage([]));
  });

  it('should include page=1 and limit=12 in the initial request', () => {
    const req = httpTesting.expectOne((r) => r.url.includes('/api/pizzerias'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('12');
    req.flush(makePage([]));
  });

  it('should render pizzeria names after a successful response', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/pizzerias')).flush(makePage([mockPizzeria]));
    await fixture.whenStable();
    expect(el.textContent).toContain('Pizza Roma');
  });

  it('should render multiple pizzeria cards', async () => {
    const second: PizzeriaSummary = { ...mockPizzeria, id: '2', name: 'Napoli Express' };
    httpTesting
      .expectOne((r) => r.url.includes('/api/pizzerias'))
      .flush(makePage([mockPizzeria, second]));
    await fixture.whenStable();
    expect(el.querySelectorAll('.pizzeria-card').length).toBe(2);
  });

  it('should show error callout on HTTP error', async () => {
    httpTesting
      .expectOne((r) => r.url.includes('/api/pizzerias'))
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();
    expect(el.querySelector('rw-callout')).not.toBeNull();
  });

  it('should show empty state when items list is empty', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/pizzerias')).flush(makePage([]));
    await fixture.whenStable();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });

  it('should make a new request with updated page param when page changes', async () => {
    httpTesting
      .expectOne((r) => r.url.includes('/api/pizzerias'))
      .flush(makePage([mockPizzeria], 3));
    await fixture.whenStable();

    const pagination = fixture.debugElement.query(By.css('rw-pagination'));
    pagination.triggerEventHandler('pageChange', 2);
    TestBed.flushEffects();

    const req2 = httpTesting.expectOne((r) => r.url.includes('/api/pizzerias'));
    expect(req2.request.params.get('page')).toBe('2');
    req2.flush(makePage([mockPizzeria], 3));
    await fixture.whenStable();
  });

  it('should include search param after debounce when searchInput signal is set', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/pizzerias')).flush(makePage([]));
    await fixture.whenStable();

    (fixture.componentInstance as any).searchInput.set('roma');
    await new Promise((resolve) => setTimeout(resolve, 350));
    TestBed.flushEffects();

    const req2 = httpTesting.expectOne((r) => r.url.includes('/api/pizzerias'));
    expect(req2.request.params.get('search')).toBe('roma');
    req2.flush(makePage([]));
    await fixture.whenStable();
  }, 2000);
});
