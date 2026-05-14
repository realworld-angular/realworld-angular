import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Surface treatment: filled, border, or minimal. */
export type ButtonVariant = 'plain' | 'outlined' | 'ghost';
/** Color intent. */
export type ButtonPalette = 'primary' | 'secondary' | 'danger';

export type ButtonSize = 'sm' | 'md';

@Component({
  selector: 'rw-button',
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  public readonly variant = input<ButtonVariant>('plain');
  public readonly palette = input<ButtonPalette>('primary');
  public readonly size = input<ButtonSize>('md');
  public readonly type = input<'button' | 'submit' | 'reset'>('button');
  public readonly isDisabled = input(false);
  public readonly isLoading = input(false);

  protected readonly buttonClasses = computed<string>(() =>
    [
      'btn',
      `btn--${this.variant()}-${this.palette()}`,
      `btn--${this.size()}`,
      this.isLoading() ? 'btn--loading' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );
}
