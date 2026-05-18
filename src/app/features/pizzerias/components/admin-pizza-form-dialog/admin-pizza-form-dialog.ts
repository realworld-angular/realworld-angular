import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { form, FormField, required, disabled, FormRoot, submit } from '@angular/forms/signals';
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

export interface AdminPizzaFormDialogData {
  editingPizza?: Pizza | null;
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(DialogRef);
  public readonly data = inject<AdminPizzaFormDialogData>(DIALOG_DATA, { optional: true });

  public readonly editingPizza = input<Pizza | null>(this.data?.editingPizza ?? null);

  protected readonly toppingsResource = httpResource<PizzaOption[]>(() => '/api/options/toppings');

  public readonly pizzaSaved = output<{ pizza: Pizza; mode: 'create' | 'edit' }>();

  protected readonly toppingError = signal('');
  protected readonly selectedToppingIds = signal(new Set<string>());

  protected readonly model = signal({
    basePrice: '10',
    name: '',
    image: null as string | null,
  });

  protected readonly pizzaForm = form(this.model, (schema) => {
    disabled(schema.name, () => true);
    required(schema.basePrice, { message: 'Price is required' });
    required(schema.image, { message: 'Select an image' });
  }, {
    submission: {
      action: async (formRef) => {
        if (Number(formRef().value().basePrice) < 0) {
          return { kind: 'serverError', message: 'Price must be ≥ 0' };
        }
        const { basePrice } = formRef().value();
        const payload = {
          basePrice: Number(basePrice),
          imageFilename: this.model().image!,
          toppingIds: Array.from(this.selectedToppingIds()),
        };
        const editing = this.editingPizza();
        const req = editing
          ? this.api.updateMyPizza(editing.id, payload)
          : this.api.createMyPizza(payload);

        try {
          const pizza = await firstValueFrom(req.pipe(takeUntilDestroyed(this.destroyRef)));
          const mode = editing ? 'edit' : 'create';
          this.pizzaSaved.emit({ pizza, mode });
        } catch {
          return { kind: 'serverError', message: 'Save failed' };
        }
        return null;
      },
    },
  });

  protected readonly modalBasePriceNumber = computed((): number | null => {
    const raw = this.model().basePrice.trim();
    if (raw === '') {
      return null;
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num < 0) {
      return null;
    }
    return num;
  });

  protected readonly modalSelectedToppingsExtraTotal = computed((): number => {
    const opts = this.toppingsResource.value() ?? [];
    const ids = this.selectedToppingIds();
    return opts.reduce((sum, o) => (ids.has(o.id) ? sum + o.price : sum), 0);
  });

  protected readonly modalPizzaEstimatedTotal = computed((): number | null => {
    const base = this.modalBasePriceNumber();
    if (base === null) {
      return null;
    }
    return base + this.modalSelectedToppingsExtraTotal();
  });

  public constructor() {
    this.hydrateFromInputs();
  }

  private hydrateFromInputs(): void {
    this.toppingError.set('');
    const editing = this.editingPizza();
    if (editing) {
      this.selectedToppingIds.set(new Set((editing.toppings ?? []).map((topping) => topping.id)));
      this.model.set({
        basePrice: String(editing.basePrice),
        name: editing.name,
        image: editing.image,
      });
    } else {
      this.selectedToppingIds.set(new Set());
      this.model.set({ basePrice: '', name: '', image: null });
    }
  }

  protected toggleFormTopping(id: string, ev: Event): void {
    const checked = (ev.target as HTMLInputElement).checked;
    const next = new Set(this.selectedToppingIds());
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    this.selectedToppingIds.set(next);
  }

  protected save(): void {
    this.toppingError.set('');
    if (this.selectedToppingIds().size === 0) {
      this.toppingError.set('Select at least one topping');
      return;
    }
    void submit(this.pizzaForm);
  }

  protected dismiss(): void {
    this.dialogRef.close();
  }
}
