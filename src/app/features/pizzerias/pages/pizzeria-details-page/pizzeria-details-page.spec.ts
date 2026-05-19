import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
  { id: 'pizza1', name: 'Margherita', basePrice: 9.5, image: 'marg.jpg', createdAt: '2024-01-01', toppings: [] },
  { id: 'pizza2', name: 'Diavola', basePrice: 11, image: 'diav.jpg', createdAt: '2024-01-01', toppings: [] },
];

const userSignal = signal<User | null>(null);
const authStub = { user: userSignal };

describe('PizzeriaDetailsPage', () => {
  let fixture: ComponentFixture<PizzeriaDetailsPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Auth, useValue: authStub },
      ],
    }).overrideComponent(PizzeriaDetailsPage, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(PizzeriaDetailsPage);
    fixture.componentRef.setInput('id', 'p1');
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should show loading indicator before response', () => {
    expect(el.querySelector('[aria-label="Loading pizzeria"]')).not.toBeNull();
    httpTesting.match((r) => r.url.includes('/api/pizzerias/p1')).forEach((r) => r.flush(mockPizzeria));
    httpTesting.match((r) => r.url.includes('/api/pizzerias/p1/pizzas')).forEach((r) => r.flush(mockPizzas));
  });

  it('should render pizzeria name after successful responses', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1') && !r.url.includes('/pizzas')).flush(mockPizzeria);
    httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas')).flush(mockPizzas);
    await fixture.whenStable();
    expect(el.textContent).toContain('Roma');
  });

  it('should render pizza names in the catalog', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1') && !r.url.includes('/pizzas')).flush(mockPizzeria);
    httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas')).flush(mockPizzas);
    await fixture.whenStable();
    expect(el.textContent).toContain('Margherita');
    expect(el.textContent).toContain('Diavola');
  });

  it('should show error state when pizzeria request fails', async () => {
    httpTesting.match((r) => r.url.includes('/api/pizzerias/p1') && !r.url.includes('/pizzas')).forEach((r) =>
      r.flush('error', { status: 404, statusText: 'Not Found' }),
    );
    httpTesting.match((r) => r.url.includes('/api/pizzerias/p1/pizzas')).forEach((r) => r.flush(mockPizzas));
    await fixture.whenStable();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });

  it('should show empty state when no pizzas returned', async () => {
    httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1') && !r.url.includes('/pizzas')).flush(mockPizzeria);
    httpTesting.expectOne((r) => r.url.includes('/api/pizzerias/p1/pizzas')).flush([]);
    await fixture.whenStable();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });
});
