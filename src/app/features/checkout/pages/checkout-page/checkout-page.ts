import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { map, Observable } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { form, FormField, required, maxLength, FormRoot } from '@angular/forms/signals';
import { CartStore } from '../../../cart/cart.store';
import { OrderApi } from '../../../orders/order-api';
import { Callout } from '../../../../shared/components/callout/callout';
import { Input } from '../../../../shared/components/input/input';
import { Textarea } from '../../../../shared/components/textarea/textarea';
import { Button } from '../../../../shared/components/button/button';
import { PhotonLocationField } from '../../../../shared/components/photon-location-field/photon-location-field';
import type { LocationValue } from '../../../../shared/components/photon-location-field/photon-location-field';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Dialog } from '@angular/cdk/dialog';
import {
  ConfirmDialog,
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../../../shared/components/confirm-dialog/confirm-dialog';
import type { Address } from '../../../../shared/models/address.model';

interface CheckoutForm {
  delivery: {
    location: LocationValue | null;
    street: string;
  };
  notes: string;
  useSameAsBilling: boolean;
  billing: {
    location: LocationValue | null;
    street: string;
  };
}

@Component({
  selector: 'rw-checkout-page',
  imports: [
    RouterLink,
    DecimalPipe,
    FormField,
    FormRoot,
    Input,
    Textarea,
    Button,
    Callout,
    PhotonLocationField,
    EmptyState,
  ],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private readonly title = inject(Title);
  protected readonly cartStore = inject(CartStore);
  private readonly api = inject(OrderApi);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);

  /** Set before navigating away after a successful order so {@link canDeactivate} does not prompt. */
  private submitted = signal(false);

  protected readonly model = signal<CheckoutForm>({
    delivery: { location: null, street: '' },
    billing: { location: null, street: '' },
    useSameAsBilling: true,
    notes: '',
  });

  protected readonly checkoutForm = form(
    this.model,
    (schema) => {
      required(schema.delivery.street, { message: 'Street address is required' });
      maxLength(schema.delivery.street, 250, { message: 'Max 250 characters' });
      required(schema.delivery.location, { message: 'Choose a location from the list' });
      maxLength(schema.notes, 300, { message: 'Max 300 characters' });

      // Billing fields are only required when the user opts to enter a different billing address.
      required(schema.billing.street, {
        message: 'Street address is required',
        when: ({ valueOf }) => !valueOf(schema.useSameAsBilling),
      });
      maxLength(schema.billing.street, 250, { message: 'Max 250 characters' });
      required(schema.billing.location, {
        message: 'Choose a location from the list',
        when: ({ valueOf }) => !valueOf(schema.useSameAsBilling),
      });
    },
    {
      submission: {
        action: async (formRef) => {
          const formValue = formRef().value();

          const delivery: Address = {
            street: formValue.delivery.street.trim(),
            city: formValue.delivery.location!.city.trim(),
            country: formValue.delivery.location!.country.trim(),
          };
          const billing: Address | undefined = !formValue.useSameAsBilling
            ? {
                street: formValue.billing.street.trim(),
                city: formValue.billing.location!.city.trim(),
                country: formValue.billing.location!.country.trim(),
              }
            : undefined;

          const payload = {
            pizzeriaId: this.cartStore.pizzeria()!.id,
            deliveryAddress: delivery,
            ...(billing ? { billingAddress: billing } : {}),
            notes: formValue.notes?.trim() || undefined,
            items: this.cartStore.items().map((item) => ({
              pizzaId: item.pizzaId,
              quantity: item.quantity,
              selectedSizeId: item.selectedSizeId ?? undefined,
              selectedOptionIds: item.selectedOptionIds,
            })),
          };

          try {
            const order = await firstValueFrom(this.api.createOrder(payload));
            this.cartStore.clear();
            this.submitted.set(true);
            void this.router.navigate(['/orders', order.id]);
          } catch {
            return { kind: 'serverError', message: 'Order failed. Please try again.' };
          }
          return null;
        },
      },
    },
  );

  public constructor() {
    effect(() => {
      const name = this.cartStore.cart()?.pizzeria.name;
      this.title.setTitle(name ? `Checkout - ${name}` : 'Checkout');
    });

    effect(() => {
      const useSameAsBilling = this.checkoutForm.useSameAsBilling().value();
      if (useSameAsBilling) {
        const current = this.model();
        if (current.billing.location !== null || current.billing.street !== '') {
          this.model.set({ ...current, billing: { location: null, street: '' } });
        }
      }
    });
  }

  public canDeactivate(): boolean | Observable<boolean> {
    if (this.submitted() || !this.checkoutForm().dirty()) {
      return true;
    }
    const ref = this.dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Leave checkout?',
        message:
          'You have entered checkout details. Leave this page? Your draft will not be saved.',
        cancelLabel: 'Stay',
        confirmLabel: 'Leave',
      },
    });
    return ref.closed.pipe(map((result) => result === 'confirmed'));
  }
}
