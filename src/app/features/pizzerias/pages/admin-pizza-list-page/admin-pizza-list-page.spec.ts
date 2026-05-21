import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Component, input, output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AdminPizzaListPage } from './admin-pizza-list-page';
import { Pizza } from '../../models/pizza.models';
import { Button } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Callout } from '../../../../shared/components/callout/callout';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

const mockPizza: Pizza = {
  id: 'pizza1',
  name: 'Margherita',
  basePrice: 9.5,
  image: 'marg.jpg',
  createdAt: '2024-01-01',
  toppings: [],
};

@Component({
  selector: '[rw-admin-pizza-row]',
  template: '',
  standalone: true,
})
class MockAdminPizzaRow {
  readonly pizza = input.required<Pizza>();
  readonly edit = output<Pizza>();
  readonly deleted = output<Pizza>();
  readonly deleteError = output<string>();
}

describe('AdminPizzaListPage', () => {
  let fixture: ComponentFixture<AdminPizzaListPage>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    }).overrideComponent(AdminPizzaListPage, {
      set: {
        imports: [Button, Spinner, Callout, EmptyState, MockAdminPizzaRow],
        schemas: [],
      },
    });

    fixture = TestBed.createComponent(AdminPizzaListPage);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should show loading indicator before response', () => {
    const req = httpTesting.expectOne('/api/admin/pizzeria/pizzas');
    expect(el.querySelector('[aria-label="Loading pizzas"]')).not.toBeNull();
    req.flush([]);
  });

  it('should render the pizzas table when pizzas exist', async () => {
    httpTesting.expectOne('/api/admin/pizzeria/pizzas').flush([mockPizza]);
    await fixture.whenStable();
    expect(el.querySelector('table[aria-label="Pizzas"]')).not.toBeNull();
  });

  it('should show empty state when no pizzas', async () => {
    httpTesting.expectOne('/api/admin/pizzeria/pizzas').flush([]);
    await fixture.whenStable();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });

  it('should show error callout on HTTP failure', async () => {
    httpTesting.expectOne('/api/admin/pizzeria/pizzas').flush('error', {
      status: 500,
      statusText: 'Server Error',
    });
    await fixture.whenStable();
    expect(el.querySelector('rw-callout')).not.toBeNull();
  });

  it('should have a create pizza button', async () => {
    httpTesting.expectOne('/api/admin/pizzeria/pizzas').flush([]);
    await fixture.whenStable();
    expect(el.querySelector('rw-button')).not.toBeNull();
  });

  it('should optimistically remove deleted pizza when child emits deleted', async () => {
    httpTesting.expectOne('/api/admin/pizzeria/pizzas').flush([mockPizza]);
    await fixture.whenStable();

    const rowDe = fixture.debugElement.query(By.directive(MockAdminPizzaRow));
    rowDe.componentInstance.deleted.emit(mockPizza);
    await fixture.whenStable();

    expect(el.querySelector('table')).toBeNull();
    expect(el.querySelector('rw-empty-state')).not.toBeNull();
  });
});
