import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'rw-modal-footer',
  template: '<ng-content />',
  styles: [
    `
      :host {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
        padding: var(--space-4) var(--space-6);
        border-block-start: 1px solid var(--color-border);
        flex-shrink: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalFooter {}
