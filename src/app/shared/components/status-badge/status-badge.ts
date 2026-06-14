import { Component, input, computed } from '@angular/core';
import type { OrderStatus } from '../../../features/orders/order.models';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  PREPARING: { label: 'Preparing', variant: 'info' },
  READY: { label: 'Ready', variant: 'success' },
  DELIVERED: { label: 'Delivered', variant: 'primary' },
  CANCELLED: { label: 'Cancelled', variant: 'default' },
};

@Component({
  selector: 'rw-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
  host: {
    '[class]': 'badgeClasses()',
  },
})
export class StatusBadge {
  public readonly status = input.required<OrderStatus>();

  protected readonly config = computed<{ label: string; variant: BadgeVariant }>(
    () => STATUS_CONFIG[this.status()] ?? STATUS_CONFIG.PENDING,
  );

  protected readonly badgeClasses = computed<string>(() => `badge badge--${this.config().variant}`);
}
