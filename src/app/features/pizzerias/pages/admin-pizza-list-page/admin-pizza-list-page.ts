import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { PizzaApi } from '../../services/pizza-api';
import { Callout } from '../../../../shared/components/callout/callout';
import { Pizza, PizzaOption } from '../../models/pizza.models';
import { Button } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Dialog } from '@angular/cdk/dialog';
import { filter, switchMap } from 'rxjs/operators';
import { AdminPizzaFormDialog, AdminPizzaFormDialogData } from '../../components/admin-pizza-form-dialog/admin-pizza-form-dialog';
import { ConfirmDialog, ConfirmDialogData, ConfirmDialogResult } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'rw-admin-pizzas-page',
  imports: [
    DecimalPipe,
    Button,
    Spinner,
    Callout,
    EmptyState,
  ],
  templateUrl: './admin-pizza-list-page.html',
  styleUrl: './admin-pizza-list-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPizzaListPage {
  private readonly api = inject(PizzaApi);
  private readonly dialog = inject(Dialog);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pizzasResource = httpResource<Pizza[]>(
    () => '/api/admin/pizzeria/pizzas',
  );

  protected readonly toppingsResource = httpResource<PizzaOption[]>(() => '/api/options/toppings');

  protected readonly deletingId = signal<string | null>(null);
  protected readonly deleteError = signal('');

  protected openCreate(): void {
    this.openPizzaFormDialog(null);
  }

  protected openEdit(pizza: Pizza): void {
    this.openPizzaFormDialog(pizza);
  }

  private openPizzaFormDialog(editingPizza: Pizza | null): void {
    const ref = this.dialog.open<void, AdminPizzaFormDialogData, AdminPizzaFormDialog>(AdminPizzaFormDialog, {
      data: { editingPizza, toppings: this.toppingsResource.value() ?? [] },
    });

    // TODO refactor to listen to close directly
    ref.componentRef?.instance.pizzaSaved.subscribe((event: { pizza: Pizza; mode: 'create' | 'edit' }) => {
      ref.close();
      const { pizza, mode } = event;
      if (mode === 'edit') {
        this.pizzasResource.set((this.pizzasResource.value() ?? []).map((existingPizza) => (existingPizza.id === pizza.id ? pizza : existingPizza)));
      } else {
        this.pizzasResource.set([...(this.pizzasResource.value() ?? []), pizza]);
      }
    });
  }

  protected toppingLabels(pizza: Pizza): string {
    return (pizza.toppings ?? []).map((topping) => topping.label).join(', ');
  }

  /** Base + sum of this pizza's configured topping prices. */
  protected menuListTotalPrice(pizza: Pizza): number {
    const base = pizza.basePrice;
    const toppingsSum = (pizza.toppings ?? []).reduce((sum, topping) => sum + topping.price, 0);
    return base + toppingsSum;
  }

  protected promptDeletePizza(pizza: Pizza): void {
    const message = `Delete "${pizza.name}"? This removes the pizza from the menu. Customers can no longer order it.`;
    const ref = this.dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: { title: 'Delete pizza?', message, cancelLabel: 'Cancel', confirmLabel: 'Delete' },
    });

    ref.closed.pipe(
      filter((result) => result === 'confirmed' && !this.deletingId()),
      switchMap(() => {
        this.deleteError.set('');
        this.deletingId.set(pizza.id);
        return this.api.deleteMyPizza(pizza.id);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.pizzasResource.set((this.pizzasResource.value() ?? []).filter((existingPizza) => existingPizza.id !== pizza.id));
        this.deletingId.set(null);
      },
      error: (err) => {
        this.deletingId.set(null);
        this.deleteError.set(err?.error?.message ?? 'Delete failed');
      },
    });
  }
}
