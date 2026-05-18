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
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { CatalogImageUrlPipe } from '../../../../shared/pipes/catalog-image-url.pipe';
import { Button } from '../../../../shared/components/button/button';

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

  private bannerHideTimer: ReturnType<typeof setTimeout> | undefined;

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

  protected readonly addedToCartBannerVisible = signal(false);

  public constructor() {
    effect(() => {
      if(this.pizzeriaResource.value()) {
        this.title.setTitle(`${this.pizzeriaResource.value()!.name} - Pizzeria`);
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.bannerHideTimer !== undefined) {
        clearTimeout(this.bannerHideTimer);
      }
    });
  }

  protected onPizzaNameSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.pizzaNameSearch.set(value);
  }

  protected openOrderModal(pizza: Pizza): void {
    const ref = this.dialog.open<string, PizzaOrderFormDialogData, PizzaOrderFormDialog>(PizzaOrderFormDialog, {
      data: { pizza, pizzeriaId: this.id(), displayPizzeriaName: this.pizzeriaResource.value()!.name },
      hasBackdrop: false,
    });

    ref.closed.subscribe((result) => {
      if (result === 'added') {
        this.showAddedToCartBanner();
      }
    });
  }

  protected dismissAddedToCartBanner(): void {
    if (this.bannerHideTimer !== undefined) {
      clearTimeout(this.bannerHideTimer);
      this.bannerHideTimer = undefined;
    }
    this.addedToCartBannerVisible.set(false);
  }

  protected showAddedToCartBanner(): void {
    if (this.bannerHideTimer !== undefined) {
      clearTimeout(this.bannerHideTimer);
    }
    this.addedToCartBannerVisible.set(true);
    this.bannerHideTimer = setTimeout(() => {
      this.bannerHideTimer = undefined;
      this.addedToCartBannerVisible.set(false);
    }, 5000);
  }
}
