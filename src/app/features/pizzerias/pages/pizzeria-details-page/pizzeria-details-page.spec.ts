import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { PizzeriaDetailsPage } from './pizzeria-details-page';
import { LoadMore } from '../../../../shared/components/load-more/load-more';
import { PizzeriaDetail } from '../../models/pizzeria.models';
import { Pizza } from '../../models/pizza.models';
import { Page } from '../../../../core/models/pagination.model';
import { Auth } from '../../../../core/services/auth';
import { User } from '../../../../core/models/user.model';

const mockPizzeria: PizzeriaDetail = {
  id: 'p1',
  name: 'Roma',
  city: 'Rome',
  country: 'Italy',
  image: 'roma.jpg',
  owner: { id: 'o1', name: 'Owner' },
  _count: { pizzas: 2 },
  createdAt: '2024-01-01',
  staff: [],
};

const mockPizzasPage: Page<Pizza> = {
  items: [
    {
      id: 'pizza1',
      name: 'Margherita',
      basePrice: 9.5,
      image: 'marg.jpg',
      createdAt: '2024-01-01',
      toppings: [],
    },
    {
      id: 'pizza2',
      name: 'Diavola',
      basePrice: 11,
      image: 'diav.jpg',
      createdAt: '2024-01-01',
      toppings: [],
    },
  ],
  total: 2,
  page: 1,
  limit: 8,
  totalPages: 1,
};

const userSignal = signal<User | null>(null);
const authStub = { user: userSignal };

function stubViewportNotNearBottom(): void {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 10_000,
    configurable: true,
  });
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
}

describe('PizzeriaDetailsPage', () => {
  let fixture: ComponentFixture<PizzeriaDetailsPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        public observe(): void {}
        public disconnect(): void {}
        public unobserve(): void {}
      },
    );
  });

  beforeEach(() => {
    stubViewportNotNearBottom();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Auth, useValue: authStub },
      ],
    });

    fixture = TestBed.createComponent(PizzeriaDetailsPage);
    fixture.componentRef.setInput('id', 'p1');
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function expectPizzeriaRequest(): ReturnType<HttpTestingController['expectOne']> {
    return httpTesting.expectOne(
      (r) => r.url.includes('/api/pizzerias/p1') && !r.url.includes('/pizzas'),
    );
  }

  function flushPizzaRequests(): void {
    for (const r of httpTesting.match((r) => r.url.includes('/api/pizzerias/p1/pizzas'))) {
      try {
        r.flush(mockPizzasPage);
      } catch {
        /* request may have already been flushed */
      }
    }
  }

  function flushInitialData(): void {
    expectPizzeriaRequest().flush(mockPizzeria);
    flushPizzaRequests();
  }

  it('should show loading indicator before response', () => {
    expect(el.querySelector('[aria-label="Loading pizzeria"]')).not.toBeNull();
    flushInitialData();
  });

  it('should render pizzeria name after successful responses', async () => {
    flushInitialData();
    await fixture.whenStable();
    expect(el.textContent).toContain('Roma');
  });

  it('should render pizza names in the catalog', async () => {
    flushInitialData();
    await fixture.whenStable();
    expect(el.textContent).toContain('Margherita');
    expect(el.textContent).toContain('Diavola');
  });

  function triggerLoadMore(): void {
    const loadMoreDe = fixture.debugElement.query(By.directive(LoadMore));
    loadMoreDe.triggerEventHandler('loadMore', undefined);
    TestBed.flushEffects();
    fixture.detectChanges();
  }

  it('should load the next page when load more is triggered and more pages exist', async () => {
    expectPizzeriaRequest().flush(mockPizzeria);
    const page1 = httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas'));
    page1.flush({
      ...mockPizzasPage,
      total: 10,
      totalPages: 2,
    });
    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();

    triggerLoadMore();

    const page2 = httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas'));
    expect(page2.request.params.get('page')).toBe('2');
    page2.flush({
      items: [
        {
          id: 'pizza3',
          name: 'Quattro Formaggi',
          basePrice: 15.5,
          image: 'quattro.jpg',
          createdAt: '2024-01-01',
          toppings: [],
        },
      ],
      total: 10,
      page: 2,
      limit: 8,
      totalPages: 2,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.textContent).toContain('Margherita');
    expect(el.textContent).toContain('Diavola');
    expect(el.textContent).toContain('Quattro Formaggi');
  });

  it('should not request another page when load more fires while pizzas are loading', async () => {
    expectPizzeriaRequest().flush(mockPizzeria);
    const page1 = httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas'));
    page1.flush({
      ...mockPizzasPage,
      total: 10,
      totalPages: 2,
    });
    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();

    triggerLoadMore();
    const page2Req = httpTesting.expectOne(
      (r) => r.url.includes('/api/pizzerias/p1/pizzas') && r.params.get('page') === '2',
    );

    triggerLoadMore();
    expect(
      httpTesting.match(
        (r) => r.url.includes('/api/pizzerias/p1/pizzas') && r.params.get('page') === '3',
      ).length,
    ).toBe(0);

    page2Req.flush({
      items: [
        {
          id: 'pizza3',
          name: 'Quattro Formaggi',
          basePrice: 15.5,
          image: 'quattro.jpg',
          createdAt: '2024-01-01',
          toppings: [],
        },
      ],
      total: 10,
      page: 2,
      limit: 8,
      totalPages: 2,
    });
  });

  it('should not load the next page when there are no more pages', async () => {
    flushInitialData();
    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();

    const pizzaReqsBefore = httpTesting.match((r) => r.url.includes('/api/pizzerias/p1/pizzas'));
    triggerLoadMore();
    expect(httpTesting.match((r) => r.url.includes('/api/pizzerias/p1/pizzas')).length).toBe(
      pizzaReqsBefore.length,
    );
  });

  it('should show a spinner while loading more pizzas', async () => {
    expectPizzeriaRequest().flush(mockPizzeria);
    const page1 = httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas'));
    page1.flush({
      ...mockPizzasPage,
      total: 10,
      totalPages: 2,
    });
    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();

    triggerLoadMore();
    fixture.detectChanges();

    expect(el.querySelector('[aria-label="Loading more pizzas"]')).not.toBeNull();
    httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas')).flush({
      items: [
        {
          id: 'pizza3',
          name: 'Quattro Formaggi',
          basePrice: 15.5,
          image: 'quattro.jpg',
          createdAt: '2024-01-01',
          toppings: [],
        },
      ],
      total: 10,
      page: 2,
      limit: 8,
      totalPages: 2,
    });
  });

  it('should show error state when pizzeria request fails', async () => {
    httpTesting
      .match((r) => r.url.includes('/api/pizzerias/p1') && !r.url.includes('/pizzas'))
      .forEach((r) => r.flush('error', { status: 404, statusText: 'Not Found' }));
    flushPizzaRequests();
    await fixture.whenStable();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });

  it('should show empty state when no pizzas returned', async () => {
    expectPizzeriaRequest().flush(mockPizzeria);
    httpTesting
      .match((r) => r.url.includes('/api/pizzerias/p1/pizzas'))
      .forEach((r) => r.flush({ items: [], total: 0, page: 1, limit: 8, totalPages: 0 }));
    await fixture.whenStable();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });

  describe('maxPrice filter', () => {
    it('should not send maxPrice param at default value', () => {
      expectPizzeriaRequest().flush(mockPizzeria);
      const req = httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas'));
      expect(req.request.params.has('maxPrice')).toBe(false);
      req.flush(mockPizzasPage);
    });

    it('should include maxPrice param when maxPrice is changed', async () => {
      flushInitialData();
      TestBed.flushEffects();
      fixture.detectChanges();
      await fixture.whenStable();
      flushPizzaRequests();

      const range = el.querySelector<HTMLInputElement>('#max-price')!;
      range.value = '10';
      range.dispatchEvent(new Event('input'));
      await new Promise((resolve) => setTimeout(resolve, 600));
      TestBed.flushEffects();

      const reqs = httpTesting.match((r) => r.url.includes('/api/pizzerias/p1/pizzas'));
      const req = reqs.find((r) => r.request.params.get('maxPrice') === '10')!;
      expect(req).toBeDefined();
      for (const r of reqs) {
        try {
          r.flush(mockPizzasPage);
        } catch {
          /* request may have already been flushed */
        }
      }
    });

    it('should include maxPrice param when name is also changed', async () => {
      flushInitialData();
      TestBed.flushEffects();
      fixture.detectChanges();
      await fixture.whenStable();
      flushPizzaRequests();

      const range = el.querySelector<HTMLInputElement>('#max-price')!;
      range.value = '15';
      range.dispatchEvent(new Event('input'));
      const searchInput = el.querySelector<HTMLInputElement>('#pizza-name-search')!;
      searchInput.value = 'Margherita';
      searchInput.dispatchEvent(new Event('input'));
      await new Promise((resolve) => setTimeout(resolve, 600));
      TestBed.flushEffects();

      const reqs = httpTesting.match((r) => r.url.includes('/api/pizzerias/p1/pizzas'));
      const req = reqs.find((r) => r.request.params.get('maxPrice') === '15')!;
      expect(req).toBeDefined();
      for (const r of reqs) {
        try {
          r.flush(mockPizzasPage);
        } catch {
          /* request may have already been flushed */
        }
      }
    });

    it('should sync maxPrice to URL query params', async () => {
      flushInitialData();
      TestBed.flushEffects();
      fixture.detectChanges();
      await fixture.whenStable();
      flushPizzaRequests();

      const navigateSpy = vi.spyOn(router, 'navigate');

      const range = el.querySelector<HTMLInputElement>('#max-price')!;
      range.value = '8';
      range.dispatchEvent(new Event('input'));
      await new Promise((resolve) => setTimeout(resolve, 600));
      TestBed.flushEffects();

      expect(navigateSpy).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          queryParams: expect.objectContaining({ maxPrice: 8 }),
          queryParamsHandling: 'merge',
          replaceUrl: true,
        }),
      );

      flushPizzaRequests();
    });
  });

  describe('name search filter', () => {
    it('should not send name param when search is empty', () => {
      expectPizzeriaRequest().flush(mockPizzeria);
      const req = httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas'));
      expect(req.request.params.has('name')).toBe(false);
      req.flush(mockPizzasPage);
    });

    it('should include name param after setting a search value', async () => {
      flushInitialData();
      TestBed.flushEffects();
      fixture.detectChanges();
      await fixture.whenStable();
      flushPizzaRequests();

      const searchInput = el.querySelector<HTMLInputElement>('#pizza-name-search')!;
      searchInput.value = 'Margherita';
      searchInput.dispatchEvent(new Event('input'));
      await new Promise((resolve) => setTimeout(resolve, 600));
      TestBed.flushEffects();

      const req = httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas'));
      expect(req.request.params.get('name')).toBe('Margherita');
      req.flush(mockPizzasPage);
    });

    it('should trim whitespace from search name', async () => {
      flushInitialData();
      TestBed.flushEffects();
      fixture.detectChanges();
      await fixture.whenStable();
      flushPizzaRequests();

      const searchInput = el.querySelector<HTMLInputElement>('#pizza-name-search')!;
      searchInput.value = '  Diavola  ';
      searchInput.dispatchEvent(new Event('input'));
      await new Promise((resolve) => setTimeout(resolve, 600));
      TestBed.flushEffects();

      const req = httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas'));
      expect(req.request.params.get('name')).toBe('Diavola');
      req.flush(mockPizzasPage);
    });
  });
});
