import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'badgeClasses()',
  }
})
export class StatusBadge {
  public readonly status = input.required<OrderStatus>();

  protected readonly config = computed<{ label: string; variant: BadgeVariant }>(() => STATUS_CONFIG[this.status()] ?? STATUS_CONFIG.PENDING);

  protected readonly badgeClasses = computed<string>(() => `badge badge--${this.config().variant}`);
}
