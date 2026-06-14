import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage, DecimalPipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { CartStore } from '../../cart.store';
import { Auth } from '../../../../core/services/auth';
import { Button } from '../../../../shared/components/button/button';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { CatalogImageUrlPipe } from '../../../../shared/pipes/catalog-image-url.pipe';

@Component({
  selector: 'rw-cart-page',
  imports: [
    RouterLink,
    NgOptimizedImage,
    DecimalPipe,
    Button,
    EmptyState,
    Spinner,
    CatalogImageUrlPipe,
  ],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {
  private readonly title = inject(Title);
  protected readonly cartStore = inject(CartStore);
  protected readonly auth = inject(Auth);

  public constructor() {
    effect(() => {
      const name = this.cartStore.cart()?.pizzeria.name;
      this.title.setTitle(name ? `Cart - ${name}` : 'Cart');
    });
  }
}
