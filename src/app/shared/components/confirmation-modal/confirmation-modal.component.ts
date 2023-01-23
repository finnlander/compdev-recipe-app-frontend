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
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'modal-content',
  templateUrl: './confirmation-modal.component.html',
})
export class ConfirmationModalComponent {
  itemDescription = '';
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
      case ConfirmationType.PROCEED_CONFIRMATION:
        return 'proceed to';
      default:
        return '' + this.confirmationType;
    }
  }

  get yesButtonClasses() {
    switch (this.confirmationType) {
      case ConfirmationType.PROCEED_CONFIRMATION:
        return 'btn-success';
      default:
        return 'btn-danger';
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
