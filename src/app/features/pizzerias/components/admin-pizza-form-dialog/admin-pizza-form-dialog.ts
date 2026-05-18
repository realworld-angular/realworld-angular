import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { form, FormField, required, disabled, FormRoot, submit, min } from '@angular/forms/signals';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { PizzaApi } from '../../services/pizza-api';
import { Callout } from '../../../../shared/components/callout/callout';
import { Pizza, PizzaOption } from '../../models/pizza.models';
import { Input } from '../../../../shared/components/input/input';
import { Button } from '../../../../shared/components/button/button';
import { ImagePicker } from '../../../../shared/components/image-picker/image-picker';
import { Modal } from '../../../../shared/components/modal/modal';
import { ModalFooter } from '../../../../shared/components/modal/modal-footer';
import { firstValueFrom } from 'rxjs';

interface AdminPizzaFormModel {
  basePrice: number;
  name: string;
  image: string | null;
  extraToppings: boolean[];
}

@Component({
  selector: 'rw-admin-pizza-form-dialog',
  imports: [
    DecimalPipe,
    FormField,
    FormRoot,
    Input,
    Button,
    ImagePicker,
    Modal,
    ModalFooter,
    Callout,
  ],
  templateUrl: './admin-pizza-form-dialog.html',
  styleUrl: './admin-pizza-form-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPizzaFormDialog {
  private readonly api = inject(PizzaApi);
  private readonly dialogRef = inject(DialogRef);
  public readonly data = inject<Pizza | null>(DIALOG_DATA, { optional: true });

  protected readonly isEditMode = this.data !== null;

  protected readonly toppingsResource = httpResource<PizzaOption[]>(() => '/api/options/toppings', {
    defaultValue: [],
  });

  protected readonly model = signal<AdminPizzaFormModel>({
    basePrice: this.data?.basePrice ?? 10,
    name: this.data?.name ?? '',
    image: this.data?.image ?? null,
    extraToppings: [],
  });

  protected readonly pizzaForm = form(this.model, (schema) => {
    disabled(schema.name, () => true);
    required(schema.basePrice, { message: 'Price is required' });
    required(schema.image, { message: 'Select an image' });
    min(schema.basePrice, 0, { message: 'Price must be ≥ 0' });
  }, {
    submission: {
      action: async (formRef) => {
        const { basePrice, image, extraToppings } = formRef().value();
        const toppingIds = extraToppings
          .map((selected, index) => selected ? this.toppingsResource.value()![index].id : null)
          .filter((t): t is string => t !== null);
        const payload = {
          basePrice,
          imageFilename: image!,
          toppingIds,
        };
        const req = this.isEditMode
          ? this.api.updatePizza(this.data!.id, payload)
          : this.api.createPizza(payload);

        try {
          const pizza = await firstValueFrom(req);
          this.dialogRef.close({ pizza, mode: this.isEditMode ? 'edit' : 'create' });
        } catch {
          return { kind: 'serverError', message: 'Save failed' };
        }
        return null;
      },
    },
  });

  protected readonly selectedToppingsPrice = computed((): number => {
    const opts = this.toppingsResource.value();
    const extra = this.model().extraToppings;
    return opts.reduce((sum, o, i) => (extra[i] ? sum + o.price : sum), 0);
  });

  protected readonly pizzaTotalPrice = computed((): number | null => {
    return (this.model().basePrice ?? 0) + this.selectedToppingsPrice();
  });

  public constructor() {
    effect(() => {
      const toppings = this.toppingsResource.value();
      if (toppings) {
        this.model.update(m => ({
          ...m,
          extraToppings: toppings.map(t => this.data?.toppings?.some(pt => pt.id === t.id) ?? false),
        }));
      }
    });
  }

  protected save(): void {
    void submit(this.pizzaForm);
  }

  protected dismiss(): void {
    this.dialogRef.close();
  }
}
