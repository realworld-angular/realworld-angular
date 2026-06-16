import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  input,
  effect,
  computed,
  linkedSignal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Pizza } from '../../models/pizza.models';
import { Page } from '../../../../core/models/pagination.model';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { RoleDirective } from '../../../../shared/directives/role.directive';
import { PizzeriaApi } from '../../services/pizzeria-api';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { PizzaOrderFormDialog } from '../../../orders/components/pizza-order-form-dialog/pizza-order-form-dialog';
import { PizzaOrderFormDialogData } from '../../../orders/order.models';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { merge, of, Subject, timer } from 'rxjs';
import { form, FormRoot, FormField, debounce } from '@angular/forms/signals';
import { Dialog } from '@angular/cdk/dialog';
import { CatalogImageUrlPipe } from '../../../../shared/pipes/catalog-image-url.pipe';
import { Button } from '../../../../shared/components/button/button';
import { LoadMore } from '../../../../shared/components/load-more/load-more';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface FilterFormModel {
  searchName: string;
  maxPrice: number;
}

@Component({
  selector: 'rw-pizzeria-detail-page',
  imports: [
    RouterLink,
    DecimalPipe,
    NgOptimizedImage,
    Spinner,
    RoleDirective,
    EmptyState,
    FormRoot,
    FormField,
    CatalogImageUrlPipe,
    Button,
    LoadMore,
  ],
  templateUrl: './pizzeria-details-page.html',
  styleUrl: './pizzeria-details-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PizzeriaDetailsPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(Dialog);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly pizzeriaApi = inject(PizzeriaApi);

  public readonly id = input.required<string>();
  public readonly maxPrice = input<string>();

  private readonly showBanner$ = new Subject<void>();
  private readonly dismissBanner$ = new Subject<void>();

  protected readonly pizzeriaResource = this.pizzeriaApi.getPizzeriaByIdResource(this.id);

  protected readonly model = signal<FilterFormModel>({
    searchName: '',
    maxPrice: Number(this.maxPrice() ?? 50),
  });

  protected readonly filterForm = form(this.model, (path) => {
    debounce(path.maxPrice, 500);
    debounce(path.searchName, 500);
  });

  protected readonly page = signal(1);

  private readonly filterParams = computed(() => ({
    ...(this.filterForm.searchName().value().trim().length > 0
      ? { name: this.filterForm.searchName().value().trim() }
      : {}),
    ...(this.filterForm.maxPrice().dirty() ? { maxPrice: this.filterForm.maxPrice().value() } : {}),
  }));

  protected readonly pizzasResource = this.pizzeriaApi.getPizzeriaPizzasResource(
    this.id,
    this.pizzeriaResource,
    this.page,
    this.filterParams,
  );

  protected readonly pizzas = linkedSignal<Page<Pizza> | undefined, Pizza[]>({
    source: () =>
      this.pizzasResource.error()
        ? { items: [], total: 0, page: 0, limit: 0, totalPages: 0 }
        : this.pizzasResource.value(),
    computation: (data, previous) => {
      const previousItems = previous?.value || [];

      if (data?.items) {
        if (data.items.length === 0) {
          return [];
        }

        return this.page() === 1 ? data.items : [...previousItems, ...data.items];
      }

      return previousItems;
    },
  });

  protected readonly hasMorePages = computed(() => {
    if (this.pizzeriaResource.status() === 'resolved') {
      return this.pizzasResource.hasValue() && this.pizzasResource.value().totalPages > this.page();
    }
    return false;
  });

  protected readonly addedToCartBannerVisible = toSignal(
    merge(
      this.showBanner$.pipe(switchMap(() => merge(of(true), timer(5000).pipe(map(() => false))))),
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

    effect(() => {
      this.filterParams();
      this.page.set(1);
    });

    effect(() => {
      this.router.navigate([], {
        queryParams: {
          ...(this.filterForm.searchName().value().trim().length > 0
            ? { name: this.filterForm.searchName().value().trim() }
            : {}),
          ...(this.filterForm.maxPrice().dirty()
            ? { maxPrice: this.filterForm.maxPrice().value() }
            : {}),
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  protected loadNextPage(): void {
    this.page.update((current) => current + 1);
  }

  protected openOrderModal(pizza: Pizza): void {
    const ref = this.dialog.open<string, PizzaOrderFormDialogData, PizzaOrderFormDialog>(
      PizzaOrderFormDialog,
      {
        data: {
          pizza,
          pizzeriaId: this.id(),
          displayPizzeriaName: this.pizzeriaResource.value()?.name ?? '',
        },
        hasBackdrop: false,
      },
    );

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
