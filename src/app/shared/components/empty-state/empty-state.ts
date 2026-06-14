import { Component, input } from '@angular/core';

@Component({
  selector: 'rw-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  public readonly title = input<string>('');
  public readonly icon = input<string>('');
  public readonly text = input<string>('');
}
