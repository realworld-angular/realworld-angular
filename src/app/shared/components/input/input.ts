import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

@Component({
  selector: 'rw-input',
  imports: [FormField],
  templateUrl: './input.html',
  styleUrl: './input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Input {
  private static nextId = 0;

  readonly label = input<string>('');
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly hint = input<string>('');
  readonly autocomplete = input<string | undefined>(undefined);
  readonly formField = input.required<FieldTree<string | number | boolean | Date | null>>();

  protected readonly uid = `rw-i-${Input.nextId++}`;
  protected readonly errorId = `${this.uid}-e`;
  protected readonly hintId = `${this.uid}-h`;
}
