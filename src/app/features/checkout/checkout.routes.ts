import { Routes } from '@angular/router';
import { CheckoutPage } from './pages/checkout-page/checkout-page';
import { checkoutStepGuard } from './guards/checkout-step.guard';
import { CheckoutWizard } from './services/checkout-wizard';
import { map, Observable } from 'rxjs';
import { inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialogResult } from '../../shared/components/confirm-dialog/confirm-dialog';
import { ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

function checkoutDeactivateGuard(): boolean | Observable<boolean> {
  const wizard = inject(CheckoutWizard);
  const dialog = inject(Dialog);

  if (wizard.submitted() || !wizard.checkoutForm().dirty()) {
    return true;
  }
  const ref = dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
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

export const checkoutRoutes: Routes = [
  {
    path: '',
    providers: [CheckoutWizard],
    children: [
      {
        path: '',
        component: CheckoutPage,
        canDeactivate: [checkoutDeactivateGuard],
        title: 'Checkout',
        children: [
          { path: '', redirectTo: 'delivery', pathMatch: 'full' },
          {
            path: 'delivery',
            loadComponent: () => import('./components/checkout-delivery-step/checkout-delivery-step').then(m => m.CheckoutDeliveryStep),
            canMatch: [checkoutStepGuard('delivery')],
          },
          {
            path: 'schedule',
            loadComponent: () => import('./components/checkout-schedule-step/checkout-schedule-step').then(m => m.CheckoutScheduleStep),
            canMatch: [checkoutStepGuard('schedule')],
          },
          {
            path: 'review',
            loadComponent: () => import('./components/checkout-review-step/checkout-review-step').then(m => m.CheckoutReviewStep),
            canMatch: [checkoutStepGuard('review')],
          },
        ],
      },
    ],
  },
];
