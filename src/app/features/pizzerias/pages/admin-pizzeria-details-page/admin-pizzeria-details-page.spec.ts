import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { signal } from '@angular/core';
import { AdminPizzeriaDetailsPage } from './admin-pizzeria-details-page';
import { PizzeriaDetail } from '../../models/pizzeria.models';
import { Auth } from '../../../../core/services/auth';

const mockPizzeria: PizzeriaDetail = {
  id: 'p1',
  name: 'Roma Admin',
  city: 'Rome',
  country: 'Italy',
  image: 'roma.jpg',
  owner: { id: 'o1', name: 'Owner' },
  _count: { pizzas: 0 },
  createdAt: '2024-01-01',
  staff: [],
};

const userSignal = signal<any>({ id: '1', role: 'PIZZERIA_ADMIN', name: 'Admin', email: 'a@b.com' });
const authStub = { user: userSignal };

describe('AdminPizzeriaDetailsPage', () => {
  let fixture: ComponentFixture<AdminPizzeriaDetailsPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Auth, useValue: authStub },
      ],
    }).overrideComponent(AdminPizzeriaDetailsPage, { set: { schemas: [NO_ERRORS_SCHEMA] } });

    fixture = TestBed.createComponent(AdminPizzeriaDetailsPage);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should show loading indicator before response', () => {
    const req = httpTesting.expectOne('/api/pizzerias/admin/pizzeria');
    expect(el.querySelector('[aria-label="Loading pizzeria"]')).not.toBeNull();
    req.flush(mockPizzeria);
  });

  it('should render the pizzeria name after successful response', async () => {
    httpTesting.expectOne('/api/pizzerias/admin/pizzeria').flush(mockPizzeria);
    await fixture.whenStable();
    expect(el.textContent).toContain('Roma Admin');
  });

  it('should show error callout on HTTP error', async () => {
    httpTesting.expectOne('/api/pizzerias/admin/pizzeria').flush('error', {
      status: 500, statusText: 'Server Error',
    });
    await fixture.whenStable();
    expect(el.querySelector('rw-callout')).not.toBeNull();
  });
});
