import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { CheckoutWizard } from '../../services/checkout-wizard';
import { Input } from '../../../../shared/components/input/input';
import { Textarea } from '../../../../shared/components/textarea/textarea';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'rw-checkout-schedule-step',
  imports: [FormField, Input, Textarea, Button],
  templateUrl: './checkout-schedule-step.html',
  styleUrl: './checkout-schedule-step.css',
})
export class CheckoutScheduleStep {
  protected readonly wizard = inject(CheckoutWizard);

  protected goBack(): void {
    this.wizard.activeStep.set('delivery');
  }

  protected async goNext(): Promise<void> {
    await this.wizard.validateStep('schedule');
  }
}
