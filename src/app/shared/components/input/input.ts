import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

@Component({
  selector: 'rw-input',
  imports: [FormField],
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class Input {
  public readonly label = input<string>('');
  public readonly type = input<string>('text');
  public readonly placeholder = input<string>('');
  public readonly hint = input<string>('');
  public readonly autocomplete = input<string | undefined>(undefined);
  public readonly formField = input.required<FieldTree<string | number | null>>();
}
