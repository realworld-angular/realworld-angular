import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Component, input, model } from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { PizzaOrderFormDialog } from './pizza-order-form-dialog';
import { PizzaOrderFormDialogData } from '../../order.models';
import { Pizza, PizzaOption, SelectedPizzaOption } from '../../../pizzerias/models/pizza.models';
import { CatalogImageUrlPipe } from '../../../../shared/pipes/catalog-image-url.pipe';
import { FormValueControl, FormField, FormRoot, ValidationError } from '@angular/forms/signals';

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

@Component({ selector: 'rw-modal', template: '{{ title() }}<ng-content/>', standalone: true })
class MockModal {
  readonly title = input<string>('');
}

@Component({ selector: 'rw-spinner', template: '', standalone: true })
class MockSpinner {}

@Component({
  selector: 'rw-button',
  template: '<button [attr.type]="type()" [disabled]="disabled() || isLoading()"><ng-content/></button>',
  standalone: true,
})
class MockButton {
  readonly type = input<string>('button');
  readonly disabled = input(false);
  readonly isLoading = input(false);
}

@Component({
  selector: 'rw-input',
  template: '<input [value]="value()" (input)="onInput($event)" [attr.type]="type()"/>',
  standalone: true,
})
class MockInput implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly label = input<string>('');
  readonly class = input<string>('');

  onInput(ev: Event) {
    this.value.set((ev.target as HTMLInputElement).value);
  }
}

@Component({
  selector: 'rw-size-option-field',
  template: '',
  standalone: true,
})
class MockSizeOptionField implements FormValueControl<SelectedPizzaOption | null> {
  readonly value = model<SelectedPizzaOption | null>(null);
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly required = input(true);
  readonly options = input<PizzaOption[]>([]);
}

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
        imports: [DecimalPipe, NgOptimizedImage, CatalogImageUrlPipe, MockModal, MockSpinner, MockButton, MockInput, MockSizeOptionField, FormRoot, FormField],
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

    const increaseBtn = el.querySelector<HTMLButtonElement>('button[aria-label="Increase quantity"]')!;
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

    const decreaseBtn = el.querySelector<HTMLButtonElement>('button[aria-label="Decrease quantity"]')!;
    expect(decreaseBtn.disabled).toBe(true);
  });

  it('should close dialog on form submission', async () => {
    httpTesting.expectOne('/api/options/sizes').flush([mockSize]);
    httpTesting.expectOne('/api/options/toppings').flush([]);
    await fixture.whenStable();
    TestBed.flushEffects();

    const sizeDe = fixture.debugElement.query(
      (de) => de.componentInstance instanceof MockSizeOptionField,
    );
    sizeDe.componentInstance.value.set({ id: 's1', label: 'Medium', price: 1 });
    TestBed.flushEffects();

    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    TestBed.flushEffects();
    httpTesting.expectOne('/api/orders/cart').flush({});

    expect(closeFn).toHaveBeenCalled();
  });
});
