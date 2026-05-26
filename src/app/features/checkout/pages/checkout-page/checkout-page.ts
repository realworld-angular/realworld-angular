import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormRoot } from '@angular/forms/signals';
import { CartStore } from '../../../cart/cart.store';
import { CheckoutWizard } from '../../services/checkout-wizard';
import { Callout } from '../../../../shared/components/callout/callout';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Dialog } from '@angular/cdk/dialog';
import { CheckoutProgressStepper } from '../../components/checkout-progress-stepper/checkout-progress-stepper';

@Component({
  selector: 'rw-checkout-page',
  imports: [
    RouterLink,
    RouterOutlet,
    DecimalPipe,
    FormRoot,
    Callout,
    EmptyState,
    CheckoutProgressStepper,
  ],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  protected readonly cartStore = inject(CartStore);
  protected readonly wizard = inject(CheckoutWizard);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);

  protected isCurrentStep(step: string): boolean {
    return this.router.url === `/checkout/${step}`;
  }
}
