import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ConfirmationResult,
  ConfirmationType,
} from '../../models/confirmation.types';

/**
 * Input props matching expected initial content.
 */
export interface ConfirmationModalContent {
  /**
   * Descriptive text for the confirmed item.
   */
  itemDescription: string;
  confirmationType: ConfirmationType;
  removeQuotes?: boolean;
}

/**
 * Confirmation modal.
 */
@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css'],
})
export class ConfirmationModalComponent {
  get description(): string {
    if (!this.data.removeQuotes) {
      return `"${this.data.itemDescription}"`;
    }

    return this.data.itemDescription;
  }

  get action(): string {
    switch (this.data.confirmationType) {
      case ConfirmationType.CLEAR_ALL:
        return 'clear all';
      case ConfirmationType.DELETE:
        return 'remove';
      case ConfirmationType.PROCEED_CONFIRMATION:
        return 'proceed to';
      default:
        return '' + this.data.confirmationType;
    }
  }

  get yesButtonClasses() {
    switch (this.data.confirmationType) {
      case ConfirmationType.PROCEED_CONFIRMATION:
        return 'button-green';
      default:
        return 'button-red';
    }
  }

  constructor(
    public dialogRef: MatDialogRef<
      ConfirmationModalComponent,
      ConfirmationResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationModalContent
  ) {}

  onConfirm() {
    this.confirm(ConfirmationResult.YES);
  }
  onCancel() {
    this.confirm(ConfirmationResult.NO);
  }

  /* Helper Methods */
  private confirm(result: ConfirmationResult) {
    this.dialogRef.close(result);
  }
}
