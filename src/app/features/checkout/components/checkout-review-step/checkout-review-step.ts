import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { CheckoutWizard } from '../../services/checkout-wizard';
import { CartStore } from '../../../cart/cart.store';
import { Input } from '../../../../shared/components/input/input';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'rw-checkout-review-step',
  imports: [DecimalPipe, NgOptimizedImage, FormField, Input, Button],
  templateUrl: './checkout-review-step.html',
  styleUrl: './checkout-review-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutReviewStep {
  protected readonly wizard = inject(CheckoutWizard);
  protected readonly cartStore = inject(CartStore);

  protected goBack(): void {
    this.wizard.activeStep.set('schedule');
  }
}
