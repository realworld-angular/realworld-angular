import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'rw-badge',
  templateUrl: './badge.html',
  styleUrl: './badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  public readonly variant = input<BadgeVariant>('default');

  protected readonly badgeClasses = computed<string>(() => `badge badge--${this.variant()}`);
}
