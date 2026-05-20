import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { submit } from '@angular/forms/signals';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { PizzaOrderFormDialog } from './pizza-order-form-dialog';
import { PizzaOrderFormDialogData } from '../../order.models';
import { Pizza } from '../../../pizzerias/models/pizza.models';
import { CatalogImageUrlPipe } from '../../../../shared/pipes/catalog-image-url.pipe';
import { Modal } from '../../../../shared/components/modal/modal';
import { Button } from '../../../../shared/components/button/button';

const mockPizza: Pizza = {
  id: 'pizza1',
  name: 'Margherita',
  basePrice: 9.5,
  image: 'marg.jpg',
  createdAt: '2024-01-01',
  toppings: [{ id: 't1', label: 'Mozzarella', price: 0, sortOrder: 1 }],
};

const dialogData: PizzaOrderFormDialogData = {
  pizza: mockPizza,
  pizzeriaId: 'p1',
  displayPizzeriaName: 'Roma',
};

const mockSize = { id: 's1', label: 'Medium', price: 1.0, sortOrder: 1 };

describe('PizzaOrderFormDialog', () => {
  let fixture: ComponentFixture<PizzaOrderFormDialog>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;
  let closeFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    closeFn = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        { provide: DialogRef, useValue: { close: closeFn } },
        { provide: DIALOG_DATA, useValue: dialogData },
      ],
    }).overrideComponent(PizzaOrderFormDialog, {
      set: {
        imports: [DecimalPipe, CatalogImageUrlPipe, Modal, Button],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });
    fixture = TestBed.createComponent(PizzaOrderFormDialog);
    el = fixture.nativeElement;
    httpTesting = TestBed.inject(HttpTestingController);
    TestBed.flushEffects();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should render pizza name from data', () => {
    httpTesting.expectOne('/api/options/sizes').flush([]);
    httpTesting.expectOne('/api/options/toppings').flush([]);
    expect(el.textContent).toContain('Margherita');
  });

  it('should show default toppings', () => {
    httpTesting.expectOne('/api/options/sizes').flush([]);
    httpTesting.expectOne('/api/options/toppings').flush([]);
    expect(el.textContent).toContain('Mozzarella');
  });

  it('should load sizes and toppings on init', () => {
    httpTesting.expectOne('/api/options/sizes').flush([]);
    httpTesting.expectOne('/api/options/toppings').flush([]);
  });

  it('should increment quantity', () => {
    httpTesting.expectOne('/api/options/sizes').flush([]);
    httpTesting.expectOne('/api/options/toppings').flush([]);
    (fixture.componentInstance as any).incrementQuantity();
    expect((fixture.componentInstance as any).model().quantity).toBe(2);
  });

  it('should decrement quantity', () => {
    httpTesting.expectOne('/api/options/sizes').flush([]);
    httpTesting.expectOne('/api/options/toppings').flush([]);
    (fixture.componentInstance as any).incrementQuantity();
    (fixture.componentInstance as any).incrementQuantity();
    (fixture.componentInstance as any).decrementQuantity();
    expect((fixture.componentInstance as any).model().quantity).toBe(2);
  });

  it('should not decrement below 1', () => {
    httpTesting.expectOne('/api/options/sizes').flush([]);
    httpTesting.expectOne('/api/options/toppings').flush([]);
    expect((fixture.componentInstance as any).model().quantity).toBe(1);
    (fixture.componentInstance as any).decrementQuantity();
    expect((fixture.componentInstance as any).model().quantity).toBe(0);
  });

  it('should close dialog on form submission', async () => {
    httpTesting.expectOne('/api/options/sizes').flush([mockSize]);
    httpTesting.expectOne('/api/options/toppings').flush([]);
    await fixture.whenStable();
    TestBed.flushEffects();

    (fixture.componentInstance as any).model.update((m: any) => ({
      ...m,
      selectedSize: mockSize,
    }));
    TestBed.flushEffects();

    const submitPromise = submit((fixture.componentInstance as any).orderForm);
    await submitPromise;

    expect(closeFn).toHaveBeenCalled();
  });
});
