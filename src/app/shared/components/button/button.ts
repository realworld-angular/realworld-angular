import { ChangeDetectionStrategy, Component, computed, input, signal, inject, DestroyRef } from '@angular/core';

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
  public readonly isError = input(false);

  protected readonly vibrating = signal(false);
  private vibrateTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly destroyRef = inject(DestroyRef);

  protected readonly buttonClasses = computed<string>(() =>
    [
      'btn',
      `btn--${this.variant()}-${this.palette()}`,
      `btn--${this.size()}`,
      this.isLoading() ? 'btn--loading' : '',
      this.vibrating() ? 'btn--vibrate' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected handleClick(): void {
    if (this.isError() && !this.vibrating()) {
      this.vibrating.set(true);
      this.vibrateTimer = setTimeout(() => {
        this.vibrating.set(false);
        this.vibrateTimer = null;
      }, 400);
    }
  }

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.vibrateTimer !== null) {
        clearTimeout(this.vibrateTimer);
      }
    });
  }
}
