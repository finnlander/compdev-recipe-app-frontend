import { Component, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
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
  selector: 'modal-content',
  templateUrl: './confirmation-modal.component.html',
})
export class ConfirmationModalComponent {
  itemDescription: string = '';
  confirmationType?: ConfirmationType;
  removeQuotes?: boolean;

  @Output() confirmationResult = new EventEmitter<ConfirmationResult>();

  get description(): string {
    if (!this.removeQuotes) {
      return `"${this.itemDescription}"`;
    }

    return this.itemDescription;
  }

  get action(): string {
    switch (this.confirmationType) {
      case ConfirmationType.CLEAR_ALL:
        return 'clear all';
      case ConfirmationType.DELETE:
        return 'remove';
      default:
        return '' + this.confirmationType;
    }
  }

  constructor(public bsModalRef: BsModalRef) {}

  onConfirm() {
    this.confirm(ConfirmationResult.YES);
  }
  onCancel() {
    this.confirm(ConfirmationResult.NO);
  }

  /* Helper Methods */
  private confirm(result: ConfirmationResult) {
    this.confirmationResult.emit(result);
    this.bsModalRef.hide();
  }
}
