import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PizzaApi } from '../../services/pizza-api';
import { Callout } from '../../../../shared/components/callout/callout';
import { Pizza } from '../../models/pizza.models';
import { Button } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Dialog } from '@angular/cdk/dialog';
import { AdminPizzaFormDialog } from '../../components/admin-pizza-form-dialog/admin-pizza-form-dialog';
import { AdminPizzaRow } from '../../components/admin-pizza-row/admin-pizza-row';

@Component({
  selector: 'rw-admin-pizzas-page',
  imports: [Button, Spinner, Callout, EmptyState, AdminPizzaRow],
  templateUrl: './admin-pizza-list-page.html',
  styleUrl: './admin-pizza-list-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPizzaListPage {
  private readonly api = inject(PizzaApi);
  private readonly dialog = inject(Dialog);

  protected readonly pizzasResource = httpResource<Pizza[]>(() => '/api/admin/pizzeria/pizzas');

  protected readonly deleteError = signal('');

  protected openCreate(): void {
    this.openPizzaFormDialog(null);
  }

  protected openEdit(pizza: Pizza): void {
    this.openPizzaFormDialog(pizza);
  }

  private openPizzaFormDialog(pizza: Pizza | null): void {
    const ref = this.dialog.open<
      { pizza: Pizza; mode: 'create' | 'edit' },
      Pizza | null,
      AdminPizzaFormDialog
    >(AdminPizzaFormDialog, {
      data: pizza,
    });

    ref.closed.subscribe((event) => {
      if (!event) return;
      const { pizza, mode } = event;
      if (mode === 'edit') {
        this.pizzasResource.set(
          (this.pizzasResource.value() ?? []).map((existingPizza) =>
            existingPizza.id === pizza.id ? pizza : existingPizza,
          ),
        );
      } else {
        this.pizzasResource.set([...(this.pizzasResource.value() ?? []), pizza]);
      }
    });
  }

  protected onPizzaDeleted(pizza: Pizza): void {
    this.pizzasResource.set((this.pizzasResource.value() ?? []).filter((p) => p.id !== pizza.id));
  }

  protected onDeleteError(message: string): void {
    this.deleteError.set(message);
  }
}
