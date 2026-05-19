import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Modal } from '../modal/modal';
import { ModalFooter } from '../modal/modal-footer';
import { Button } from '../button/button';

export interface ConfirmDialogData {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export type ConfirmDialogResult = 'confirmed' | 'dismissed';

@Component({
  selector: 'rw-confirm-dialog',
  imports: [Modal, ModalFooter, Button],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  private readonly dialogRef = inject(DialogRef<ConfirmDialogResult>);
  public readonly data = inject<ConfirmDialogData>(DIALOG_DATA);

  protected dismiss(): void {
    this.dialogRef.close('dismissed');
  }

  protected confirm(): void {
    this.dialogRef.close('confirmed');
  }
}
