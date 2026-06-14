import { Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { CheckoutWizard } from '../../services/checkout-wizard';
import { Input } from '../../../../shared/components/input/input';
import { Button } from '../../../../shared/components/button/button';
import { PhotonLocationField } from '../../../../shared/components/photon-location-field/photon-location-field';

@Component({
  selector: 'rw-checkout-delivery-step',
  imports: [FormField, Input, Button, PhotonLocationField],
  templateUrl: './checkout-delivery-step.html',
  styleUrl: './checkout-delivery-step.css',
})
export class CheckoutDeliveryStep {
  protected readonly wizard = inject(CheckoutWizard);

  protected async goNext(): Promise<void> {
    await this.wizard.validateStep('delivery');
  }
}
