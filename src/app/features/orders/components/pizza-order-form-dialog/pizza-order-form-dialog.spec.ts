import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { PizzaOrderFormDialog } from './pizza-order-form-dialog';
import { PizzaOrderFormDialogData } from '../../order.models';
import { Pizza } from '../../../pizzerias/models/pizza.models';
import { CartStore } from '../../../cart/cart.store';
import { CatalogImageUrlPipe } from '../../../../shared/pipes/catalog-image-url.pipe';
import { FormField, FormRoot } from '@angular/forms/signals';
import { Button } from '../../../../shared/components/button/button';
import { Modal } from '../../../../shared/components/modal/modal';
import { Input } from '../../../../shared/components/input/input';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { SizeOptionField } from '../pizza-size-option-field/pizza-size-option-field';

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

const cartStoreStub = {
  hasItemsForOtherPizzeria: vi.fn().mockReturnValue(false),
  addItem: vi.fn(),
  clear: vi.fn(),
};

describe('PizzaOrderFormDialog', () => {
  let fixture: ComponentFixture<PizzaOrderFormDialog>;
  let el: HTMLElement;
  let httpTesting: HttpTestingController;
  let closeFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    closeFn = vi.fn();
    cartStoreStub.addItem.mockClear();
    cartStoreStub.clear.mockClear();
    cartStoreStub.hasItemsForOtherPizzeria.mockReturnValue(false);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        { provide: DialogRef, useValue: { close: closeFn } },
        { provide: DIALOG_DATA, useValue: dialogData },
        { provide: CartStore, useValue: cartStoreStub },
      ],
    }).overrideComponent(PizzaOrderFormDialog, {
      set: {
        imports: [
          DecimalPipe,
          NgOptimizedImage,
          CatalogImageUrlPipe,
          Modal,
          Spinner,
          Button,
          Input,
          SizeOptionField,
          FormRoot,
          FormField,
        ],
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

    el.querySelector<HTMLButtonElement>('button[aria-label="Increase quantity"]')!.click();
    TestBed.flushEffects();

    expect(el.textContent).toContain('€19.00');
  });

  it('should decrement quantity', () => {
    httpTesting.expectOne('/api/options/sizes').flush([]);
    httpTesting.expectOne('/api/options/toppings').flush([]);

    const increaseBtn = el.querySelector<HTMLButtonElement>(
      'button[aria-label="Increase quantity"]',
    )!;
    increaseBtn.click();
    TestBed.flushEffects();
    increaseBtn.click();
    TestBed.flushEffects();
    el.querySelector<HTMLButtonElement>('button[aria-label="Decrease quantity"]')!.click();
    TestBed.flushEffects();

    expect(el.textContent).toContain('€19.00');
  });

  it('should not decrement below 1', () => {
    httpTesting.expectOne('/api/options/sizes').flush([]);
    httpTesting.expectOne('/api/options/toppings').flush([]);

    const decreaseBtn = el.querySelector<HTMLButtonElement>(
      'button[aria-label="Decrease quantity"]',
    )!;
    expect(decreaseBtn.disabled).toBe(true);
  });

  it('should close dialog on form submission', async () => {
    httpTesting.expectOne('/api/options/sizes').flush([mockSize]);
    httpTesting.expectOne('/api/options/toppings').flush([]);
    fixture.detectChanges();
    TestBed.flushEffects();

    fixture.componentInstance['orderForm'].selectedSize().value.set(mockSize);
    fixture.detectChanges();
    TestBed.flushEffects();

    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    TestBed.flushEffects();

    expect(cartStoreStub.addItem).toHaveBeenCalledWith('pizza1', 1, 's1', [], 'p1');
    expect(closeFn).toHaveBeenCalled();
  });
});
