import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  computed,
  input,
  effect,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { PizzeriaDetail } from '../../models/pizzeria.models';
import { Pizza } from '../../models/pizza.models';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { RoleDirective } from '../../../../shared/directives/role.directive';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { PizzaOrderFormDialog } from '../../../orders/components/pizza-order-form-dialog/pizza-order-form-dialog';
import { PizzaOrderFormDialogData } from '../../../orders/order.models';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { merge, of, Subject, timer } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { CatalogImageUrlPipe } from '../../../../shared/pipes/catalog-image-url.pipe';
import { Button } from '../../../../shared/components/button/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'rw-pizzeria-detail-page',
  imports: [
    RouterLink,
    DecimalPipe,
    NgOptimizedImage,
    Spinner,
    RoleDirective,
    EmptyState,
    FormsModule,
    CatalogImageUrlPipe,
    Button,
  ],
  templateUrl: './pizzeria-details-page.html',
  styleUrl: './pizzeria-details-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PizzeriaDetailsPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(Dialog);
  private readonly title = inject(Title);

  public readonly id = input.required<string>();

  private readonly showBanner$ = new Subject<void>();
  private readonly dismissBanner$ = new Subject<void>();

  protected readonly pizzeriaResource = httpResource<PizzeriaDetail>(
    () => `/api/pizzerias/${this.id()}`,
  );

  // Pizza name search
  protected readonly pizzaNameSearch = signal('');
  private readonly debouncedSearch = toSignal(
    toObservable(this.pizzaNameSearch).pipe(
      debounceTime(300),
      map((search: string) => search.trim()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  protected readonly pizzasResource = httpResource<Pizza[]>(() => ({
    url: `/api/pizzerias/${this.id()}/pizzas`,
    params: {
      ...(this.hasActivePizzaSearch() ? { name: this.debouncedSearch() } : {}),
    },
  }));

  protected readonly hasActivePizzaSearch = computed<boolean>(() => this.debouncedSearch().length > 0);

  protected readonly addedToCartBannerVisible = toSignal(
    merge(
      this.showBanner$.pipe(
        switchMap(() => merge(of(true), timer(5000).pipe(map(() => false)))),
      ),
      this.dismissBanner$.pipe(map(() => false)),
    ),
    { initialValue: false },
  );

  public constructor() {
    effect(() => {
      if (this.pizzeriaResource.status() === 'resolved') {
        const pizzeria = this.pizzeriaResource.value();
        if (pizzeria) {
          this.title.setTitle(`${pizzeria.name} - Pizzeria`);
        }
      }
    });
  }

  protected onPizzaNameSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.pizzaNameSearch.set(value);
  }

  protected openOrderModal(pizza: Pizza): void {
    const ref = this.dialog.open<string, PizzaOrderFormDialogData, PizzaOrderFormDialog>(PizzaOrderFormDialog, {
      data: { pizza, pizzeriaId: this.id(), displayPizzeriaName: this.pizzeriaResource.value()?.name ?? '' },
      hasBackdrop: false,
    });

    ref.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result === 'added') {
        this.showAddedToCartBanner();
      }
    });
  }

  protected dismissAddedToCartBanner(): void {
    this.dismissBanner$.next();
  }

  protected showAddedToCartBanner(): void {
    this.showBanner$.next();
  }
}
