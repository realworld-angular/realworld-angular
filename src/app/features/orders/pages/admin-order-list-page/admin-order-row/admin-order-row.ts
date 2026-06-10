import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { OrderApi } from '../../../services/order-api';
import { AdminOrderListItem } from '../../../order.models';
import { Dialog } from '@angular/cdk/dialog';
import { filter, switchMap } from 'rxjs/operators';
import {
  ConfirmDialog,
  ConfirmDialogData,
  ConfirmDialogResult,
} from '../../../../../shared/components/confirm-dialog/confirm-dialog';
import { StatusBadge } from '../../../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'tr[rw-admin-order-row]',
  imports: [DecimalPipe, DatePipe, NgOptimizedImage, StatusBadge],
  templateUrl: './admin-order-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderRow {
  private readonly api = inject(OrderApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(Dialog);

  public readonly order = input.required<AdminOrderListItem>();

  public readonly updateOrder = output<AdminOrderListItem>();
  public readonly showFeedback = output<{ variant: 'error' | 'success'; message: string }>();

  public promptCancelOrder(): void {
    const ref = this.dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Cancel order?',
        message: 'Cancel this pending order? This sets the status to cancelled.',
        cancelLabel: 'Keep order',
        confirmLabel: 'Cancel order',
      },
    });

    ref.closed
      .pipe(
        filter((result) => result === 'confirmed'),
        switchMap(() => this.api.cancelOrder(this.order().id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updated) => {
          this.updateOrder.emit(updated);
          this.showFeedback.emit({ variant: 'success', message: 'Order cancelled.' });
        },
        error: (err) => {
          this.showFeedback.emit({ variant: 'error', message: err?.error?.message ?? 'Failed' });
        },
      });
  }

  public promptDeliverOrder(): void {
    const ref = this.dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Mark delivered?',
        message: 'Mark this order as delivered?',
        cancelLabel: 'Not yet',
        confirmLabel: 'Mark delivered',
      },
    });

    ref.closed
      .pipe(
        filter((result) => result === 'confirmed'),
        switchMap(() => this.api.deliverOrder(this.order().id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updated) => {
          this.updateOrder.emit(updated);
          this.showFeedback.emit({ variant: 'success', message: 'Order marked as delivered.' });
        },
        error: (err) => {
          this.showFeedback.emit({ variant: 'error', message: err?.error?.message ?? 'Failed' });
        },
      });
  }
}
