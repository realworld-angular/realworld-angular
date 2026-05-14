import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OrderApi } from '../../../order-api';
import { AdminOrderListItem } from '../../../order.models';
import { Dialog } from '@angular/cdk/dialog';
import { filter, switchMap } from 'rxjs/operators';
import { ConfirmDialog, ConfirmDialogData, ConfirmDialogResult } from '../../../../../shared/components/confirm-dialog/confirm-dialog';
import { StatusBadge } from "../../../../../shared/components/status-badge/status-badge";

@Component({
  selector: 'tr[rw-admin-order-row]',
  imports: [DecimalPipe, DatePipe, StatusBadge],
  templateUrl: './admin-order-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderRow {
  public readonly order = input.required<AdminOrderListItem>();

  public readonly orderUpdated = output<AdminOrderListItem>();
  public readonly feedback = output<{ variant: 'error' | 'success'; message: string }>();

  private readonly api = inject(OrderApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(Dialog);

  public readonly isRowBusy = computed<boolean>(() => false);

  public promptCancelOrder(): void {
    const ref = this.dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: 'Cancel order?',
        message: 'Cancel this pending order? This sets the status to cancelled.',
        cancelLabel: 'Keep order',
        confirmLabel: 'Cancel order',
      },
    });

    ref.closed.pipe(
      filter((result) => result === 'confirmed'),
      switchMap(() => this.api.cancelOrder(this.order().id).pipe(takeUntilDestroyed(this.destroyRef))),
    ).subscribe({
      next: (updated) => {
        this.orderUpdated.emit(updated as AdminOrderListItem);
        this.feedback.emit({ variant: 'success', message: 'Order cancelled.' });
      },
      error: (err) => {
        this.feedback.emit({ variant: 'error', message: err?.error?.message ?? 'Failed' });
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

    ref.closed.pipe(
      filter((result) => result === 'confirmed'),
      switchMap(() => this.api.deliverOrder(this.order().id).pipe(takeUntilDestroyed(this.destroyRef))),
    ).subscribe({
      next: (updated) => {
        this.orderUpdated.emit(updated as AdminOrderListItem);
        this.feedback.emit({ variant: 'success', message: 'Order marked as delivered.' });
      },
      error: (err) => {
        this.feedback.emit({ variant: 'error', message: err?.error?.message ?? 'Failed' });
      },
    });
  }
}
