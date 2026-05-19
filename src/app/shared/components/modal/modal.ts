import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'rw-modal',
  imports: [NgOptimizedImage],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  public readonly dialogRef = inject(DialogRef);

  public readonly title = input('');

  protected closeDialog(): void {
    this.dialogRef.close();
  }
}
