import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { form, FormField, FormRoot, min, required } from '@angular/forms/signals';
import { CartStore } from '../../../cart/cart.store';
import { PizzaOption } from '../../../pizzerias/models/pizza.models';
import { PizzaOrderFormDialogData } from '../../order.models';
import { Button } from '../../../../shared/components/button/button';
import { Modal } from '../../../../shared/components/modal/modal';
import { Input } from '../../../../shared/components/input/input';
import { CatalogImageUrlPipe } from '../../../../shared/pipes/catalog-image-url.pipe';
import { SizeOptionField } from '../pizza-size-option-field/pizza-size-option-field';
import { Spinner } from '../../../../shared/components/spinner/spinner';

interface PizzaOrderFormModel {
  selectedSize: PizzaOption | null;
  extraToppings: boolean[];
  quantity: number;
}

@Component({
  selector: 'rw-pizza-order-form-dialog',
  imports: [Modal, DecimalPipe, NgOptimizedImage, Button, CatalogImageUrlPipe, FormField, FormRoot, Input, SizeOptionField, Spinner],
  templateUrl: './pizza-order-form-dialog.html',
  styleUrl: './pizza-order-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PizzaOrderFormDialog {
  private readonly cart = inject(CartStore);
  private readonly dialogRef = inject(DialogRef);
  protected readonly data = inject<PizzaOrderFormDialogData>(DIALOG_DATA);

  protected readonly sizesResource = httpResource<PizzaOption[]>(() => '/api/options/sizes', {
    defaultValue: [],
  });
  protected readonly toppingsResource = httpResource<PizzaOption[]>(() => '/api/options/toppings', {
    defaultValue: [],
  });

  public readonly defaultToppings = this.data.pizza.toppings.map((topping) => topping.label).join(', ');

  protected readonly model = signal<PizzaOrderFormModel>({
    selectedSize: null,
    extraToppings: [],
    quantity: 1,
  });

  protected readonly orderForm = form(this.model, (schema) => {
    required(schema.selectedSize, { message: 'Please select a size' });
    required(schema.quantity, { message: 'Quantity is required' });
    min(schema.quantity, 1, { message: 'Quantity must be at least 1' });
  }, {
    submission: {
      action: async (form) => {
        if (this.cart.hasItemsForOtherPizzeria(this.data.pizzeriaId)) {
          this.cart.clear();
        }

        const { selectedSize, extraToppings, quantity } = form().value();
        this.cart.addItem(
          this.data.pizza.id,
          Number(quantity),
          selectedSize?.id ?? null,
          extraToppings
            .map((selected, index) => selected ? this.toppingsResource.value()![index].id : null)
            .filter((t): t is string => t !== null),
          this.data.pizzeriaId,
        );
        this.dialogRef.close('added');
        return null;
      },
    },
  });

  protected readonly modalTotal = computed<number>(() => {
    const { selectedSize, extraToppings, quantity } = this.orderForm().value();
    const pizza = this.data.pizza;
    const sizePrice = selectedSize?.price ?? 0;
    const toppingsPrice = extraToppings.reduce((sum, topping, index) => sum + (topping ? this.toppingsResource.value()![index].price : 0), 0);
    return (pizza.basePrice + sizePrice + toppingsPrice) * Number(quantity);
  });

  public constructor() {
    effect(() => {
      const toppings = this.toppingsResource.value();
      if (toppings) {
        this.model.update(m => ({
          ...m,
          extraToppings: toppings.map(() => false),
        }));
      }
    });
  }

  protected decrementQuantity(): void {
    const current = this.model();
    const qty = Number(current.quantity);
    this.model.set({ ...current, quantity: qty - 1 });
  }

  protected incrementQuantity(): void {
    const current = this.model();
    this.model.set({ ...current, quantity: Number(current.quantity) + 1 });
  }
}
