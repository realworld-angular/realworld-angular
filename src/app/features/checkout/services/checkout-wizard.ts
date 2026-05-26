import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { form, required, maxLength, submit, FieldTree } from '@angular/forms/signals';
import { CartStore } from '../../cart/cart.store';
import { OrderApi } from '../../orders/order-api';
import type { LocationValue } from '../../../shared/components/photon-location-field/photon-location-field';
import type { Address } from '../../../shared/models/address.model';

export type WizardStep = 'delivery' | 'schedule' | 'review';

type ValidatableStep = Exclude<WizardStep, 'review'>;

export interface CheckoutForm {
  delivery: {
    location: LocationValue | null;
    street: string;
    useSameAsBilling: boolean;
    billingLocation: LocationValue | null;
    billingStreet: string;
  };
  schedule: {
    type: 'asap' | 'scheduled';
    date: string;
    time: string;
  };
  notes: string;
  tip: {
    type: 'none' | 'ten' | 'fifteen' | 'twenty' | 'custom';
    customAmount: number;
  };
}

@Injectable()
export class CheckoutWizard {
  private readonly cartStore = inject(CartStore);
  private readonly api = inject(OrderApi);
  private readonly router = inject(Router);

  readonly activeStep = signal<WizardStep>('delivery');

  readonly stepStatus = signal<Record<WizardStep, 'success' | 'error' | null>>({
    delivery: null,
    schedule: null,
    review: null,
  });

  private readonly model = signal<CheckoutForm>({
    delivery: {
      location: null,
      street: '',
      useSameAsBilling: true,
      billingLocation: null,
      billingStreet: '',
    },
    schedule: {
      type: 'asap',
      date: '',
      time: '',
    },
    notes: '',
    tip: {
      type: 'none',
      customAmount: 0,
    },
  });

  readonly submitted = signal(false);

  readonly checkoutForm = form(
    this.model,
    (schema) => {
      required(schema.delivery.street, { message: 'Street address is required' });
      maxLength(schema.delivery.street, 250, { message: 'Max 250 characters' });
      required(schema.delivery.location, { message: 'Choose a location from the list' });
      maxLength(schema.notes, 300, { message: 'Max 300 characters' });

      required(schema.delivery.billingStreet, {
        message: 'Street address is required',
        when: ({ valueOf }) => !valueOf(schema.delivery.useSameAsBilling),
      });
      maxLength(schema.delivery.billingStreet, 250, { message: 'Max 250 characters' });
      required(schema.delivery.billingLocation, {
        message: 'Choose a location from the list',
        when: ({ valueOf }) => !valueOf(schema.delivery.useSameAsBilling),
      });

      required(schema.schedule.date, {
        message: 'Choose a delivery date',
        when: ({ valueOf }) => valueOf(schema.schedule.type) === 'scheduled',
      });
      required(schema.schedule.time, {
        message: 'Choose a delivery time',
        when: ({ valueOf }) => valueOf(schema.schedule.type) === 'scheduled',
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
          const billing: Address | undefined = !formValue.delivery.useSameAsBilling
            ? {
                street: formValue.delivery.billingStreet.trim(),
                city: formValue.delivery.billingLocation!.city.trim(),
                country: formValue.delivery.billingLocation!.country.trim(),
              }
            : undefined;

          const tipAmount = this.tipAmount();
          const scheduledAt =
            formValue.schedule.type === 'scheduled' &&
            formValue.schedule.date &&
            formValue.schedule.time
              ? new Date(
                  `${formValue.schedule.date}T${formValue.schedule.time}`,
                ).toISOString()
              : undefined;

          const payload = {
            pizzeriaId: this.cartStore.pizzeria()!.id,
            deliveryAddress: delivery,
            ...(billing ? { billingAddress: billing } : {}),
            notes: formValue.notes?.trim() || undefined,
            tipAmount: tipAmount > 0 ? tipAmount : undefined,
            scheduledAt,
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

  readonly tipAmount = computed(() => {
    const m = this.model();
    const total = this.cartStore.totalPrice();
    switch (m.tip.type) {
      case 'none':
        return 0;
      case 'ten':
        return Math.round(total * 10) / 100;
      case 'fifteen':
        return Math.round(total * 15) / 100;
      case 'twenty':
        return Math.round(total * 20) / 100;
      case 'custom':
        return m.tip.customAmount;
    }
  });

  readonly totalWithTip = computed(() => this.cartStore.totalPrice() + this.tipAmount());

  private readonly nextStep: Record<ValidatableStep, WizardStep> = {
    delivery: 'schedule',
    schedule: 'review',
  };

  constructor() {
    effect(() => {
      const useSameAsBilling = this.checkoutForm.delivery.useSameAsBilling().value();
      if (useSameAsBilling) {
        const current = this.model();
        if (current.delivery.billingLocation !== null || current.delivery.billingStreet !== '') {
          this.model.update((m) => ({
            ...m,
            delivery: { ...m.delivery, billingLocation: null, billingStreet: '' },
          }));
        }
      }
    });

    effect(() => {
      this.router.navigate(['/checkout', this.activeStep()]);
    });
  }

  isStepValid(step: ValidatableStep): boolean {
    const fieldTree = this.checkoutForm[step] as FieldTree<CheckoutForm[typeof step]>;
    return fieldTree().valid();
  }

  async validateStep(
    step: ValidatableStep,
  ): Promise<void> {
    const success = await this.submitValidatableStep(step);

    if (success) {

    this.stepStatus.update((status) => ({ ...status, [step]: 'success' }));
    const next = this.nextStep[step];
    this.activeStep.set(next);
    await this.router.navigate(['/checkout', next]);
    }
  }

  private submitValidatableStep<S extends ValidatableStep>(step: S): Promise<boolean> {
    const fieldTree = this.checkoutForm[step] as FieldTree<CheckoutForm[S]>;
    return submit(fieldTree, async () => null);
  }
}
