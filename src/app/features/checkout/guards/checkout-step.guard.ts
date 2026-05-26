import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { CheckoutWizard, type WizardStep } from '../services/checkout-wizard';

const prerequisiteSteps: Record<WizardStep, readonly ('delivery' | 'schedule')[]> = {
  delivery: [],
  schedule: ['delivery'],
  review: ['delivery', 'schedule'],
};

export function checkoutStepGuard(step: WizardStep): CanMatchFn {
  return () => {
    const wizard = inject(CheckoutWizard);
    const router = inject(Router);

    const blockedBy = prerequisiteSteps[step].find((s) => !wizard.isStepValid(s));
    if (blockedBy) {
      return router.createUrlTree(['/checkout', blockedBy]);
    }

    wizard.activeStep.set(step);
    return true;
  };
}
