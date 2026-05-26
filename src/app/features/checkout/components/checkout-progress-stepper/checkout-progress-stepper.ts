import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

export type CheckoutProgressStepperStatus = 'success' | 'error' | null;

@Component({
  selector: 'rw-checkout-progress-stepper',
  imports: [NgOptimizedImage],
  templateUrl: './checkout-progress-stepper.html',
  styleUrl: './checkout-progress-stepper.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'checkout-step',
    '[class.checkout-step--active]': 'active()',
  },
})
export class CheckoutProgressStepper {
  readonly order = input.required<number>();
  readonly label = input.required<string>();
  readonly active = input(false);
  readonly status = input<CheckoutProgressStepperStatus>(null);
}
