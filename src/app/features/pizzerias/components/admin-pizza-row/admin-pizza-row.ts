import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { filter, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Pizza } from '../../models/pizza.models';
import { PizzaApi } from '../../services/pizza-api';
import { ConfirmDialog, ConfirmDialogData, ConfirmDialogResult } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: '[rw-admin-pizza-row]',
  imports: [DecimalPipe],
  templateUrl: './admin-pizza-row.html',
  styleUrl: './admin-pizza-row.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.aria-label]': '"Pizza: " + pizza().name' },
})
export class AdminPizzaRow {
  private readonly api = inject(PizzaApi);
  private readonly dialog = inject(Dialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly pizza = input.required<Pizza>();

  readonly edit = output<Pizza>();
  readonly deleted = output<Pizza>();
  readonly deleteError = output<string>();

  protected readonly deleting = signal(false);

  protected toppingLabels(): string {
    return (this.pizza().toppings ?? []).map((t) => t.label).join(', ');
  }

  protected menuListTotalPrice(): number {
    const pizza = this.pizza();
    return pizza.basePrice + (pizza.toppings ?? []).reduce((sum, t) => sum + t.price, 0);
  }

  protected promptDelete(): void {
    const pizza = this.pizza();
    const message = `Delete "${pizza.name}"? This removes the pizza from the menu. Customers can no longer order it.`;
    const ref = this.dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: { title: 'Delete pizza?', message, cancelLabel: 'Cancel', confirmLabel: 'Delete' },
    });

    ref.closed.pipe(
      filter((result) => result === 'confirmed' && !this.deleting()),
      switchMap(() => {
        this.deleteError.emit('');
        this.deleting.set(true);
        return this.api.deleteMyPizza(pizza.id);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleted.emit(pizza);
      },
      error: (err) => {
        this.deleting.set(false);
        this.deleteError.emit(err?.error?.message ?? 'Delete failed');
      },
    });
  }
}
