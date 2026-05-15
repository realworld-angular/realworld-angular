import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage, DecimalPipe } from '@angular/common';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  protected readonly cart = inject(CartStore);
  protected readonly auth = inject(Auth);
}
