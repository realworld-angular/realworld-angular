import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'rw-callout',
  templateUrl: './callout.html',
  styleUrl: './callout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'callout',
    '[class.callout--error]': "variant() === 'error'",
    '[class.callout--success]': "variant() === 'success'",
    '[class.callout--neutral]': "variant() === 'neutral'",
    '[class.callout--has-heading]': '!!heading()',
    '[attr.role]': 'roleAttr()',
    '[attr.aria-live]': 'ariaLiveAttr()',
  },
})
export class Callout {
  public readonly message = input('');
  public readonly heading = input('');
  public readonly variant = input<'error' | 'success' | 'neutral'>('error');

  protected readonly roleAttr = computed<'alert' | 'status' | null>(() => {
    const variant = this.variant();
    if (variant === 'error') {
      return 'alert';
    }
    if (variant === 'success') {
      return 'status';
    }
    return null;
  });

  protected readonly ariaLiveAttr = computed<'assertive' | 'polite' | null>(() => {
    const variant = this.variant();
    if (variant === 'error') {
      return 'assertive';
    }
    if (variant === 'success') {
      return 'polite';
    }
    return null;
  });
}
