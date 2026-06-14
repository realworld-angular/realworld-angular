import { Component, input, model } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { PizzaOption, SelectedPizzaOption } from '../../../pizzerias/models/pizza.models';

@Component({
  selector: 'rw-size-option-field',
  imports: [DecimalPipe],
  templateUrl: './pizza-size-option-field.html',
  styleUrl: './pizza-size-option-field.css',
})
export class SizeOptionField implements FormValueControl<SelectedPizzaOption | null> {
  public readonly options = input.required<PizzaOption[]>();

  public readonly value = model<SelectedPizzaOption | null>(null);
  public readonly touched = model(false);

  public readonly invalid = input(false);
  public readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  public readonly disabled = input(false);
  public readonly required = input(true);

  protected toggle(option: PizzaOption): void {
    if (this.disabled()) {
      return;
    }
    const current = this.value();
    if (current?.id === option.id) {
      this.value.set(null);
    } else {
      this.value.set({
        id: option.id,
        label: option.label,
        price: option.price,
      });
    }
    this.touched.set(true);
  }

  protected isSelected(option: PizzaOption): boolean {
    return this.value()?.id === option.id;
  }
}
