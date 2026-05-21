import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { PizzeriaDetailsPage } from './pizzeria-details-page';
import { PizzeriaDetail } from '../../models/pizzeria.models';
import { Pizza } from '../../models/pizza.models';
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

const mockPizzas: Pizza[] = [
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
];

const userSignal = signal<User | null>(null);
const authStub = { user: userSignal };

describe('PizzeriaDetailsPage', () => {
  let fixture: ComponentFixture<PizzeriaDetailsPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
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
        r.flush(mockPizzas);
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
      .forEach((r) => r.flush([]));
    await fixture.whenStable();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });

  describe('maxPrice filter', () => {
    it('should not send maxPrice param at default value', () => {
      expectPizzeriaRequest().flush(mockPizzeria);
      const req = httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas'));
      expect(req.request.params.has('maxPrice')).toBe(false);
      req.flush(mockPizzas);
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
          r.flush(mockPizzas);
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
          r.flush(mockPizzas);
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
      req.flush(mockPizzas);
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
      req.flush(mockPizzas);
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
      req.flush(mockPizzas);
    });
  });
});
