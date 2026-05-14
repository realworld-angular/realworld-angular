import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { FieldState, FieldTree, FormField } from '@angular/forms/signals';

@Component({
  selector: 'rw-textarea',
  imports: [FormField],
  templateUrl: './textarea.html',
  styleUrl: './textarea.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Textarea {
  private static nextId = 0;

  public readonly label = input<string>('');
  public readonly placeholder = input<string>('');
  public readonly isRequired = input<boolean>(false);
  public readonly maxLength = input<number | undefined>(undefined);
  public readonly rows = input<number>(4);
  public readonly hint = input<string>('');
  public readonly formField = input.required<FieldTree<string>>();

  protected readonly uid = `rw-ta-${Textarea.nextId++}`;
  protected readonly errorId = `${this.uid}-e`;
  protected readonly hintId = `${this.uid}-h`;

  protected field(): FieldState<string> | null {
    const fieldTree = this.formField();
    return fieldTree ? fieldTree() : null;
  }

  protected readonly charCount = computed<number>(() => {
    const fieldTree = this.formField();
    if (!fieldTree) {
      return 0;
    }
    const val = fieldTree()?.value?.();
    return typeof val === 'string' ? val.length : 0;
  });
}
