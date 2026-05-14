import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { CartStore } from '../../cart.store';
import { Auth } from '../../../../core/services/auth';
import { Button } from '../../../../shared/components/button/button';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { CatalogImageUrlPipe } from '../../../../shared/pipes/catalog-image-url.pipe';

@Component({
  selector: 'rw-cart-page',
  imports: [RouterLink, DecimalPipe, NgOptimizedImage, Button, EmptyState, CatalogImageUrlPipe],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  protected readonly cart = inject(CartStore);
  protected readonly auth = inject(Auth);
}
