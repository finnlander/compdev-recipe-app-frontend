import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmationModalComponent,
  ConfirmationModalContent,
} from '../components/confirmation-modal/confirmation-modal.component';
import {
  ConfirmationResult,
  ConfirmationType,
} from '../models/confirmation.types';

/* Input data structures */

export interface ConfirmationOperationProps {
  confirmationType: ConfirmationType;
  itemDescription: string;

  /**
   * Callback function for confirmation result.
   */
  onConfirmationResult?: (result: ConfirmationResult) => void;
  /**
   * Callback function for confirming 'yes' as a result.
   */
  onConfirmYes?: () => void;
  removeQuotes?: boolean;
}

/**
 * Service for handling UI confirmation actions.
 */
@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private dialog: MatDialog) {}

  /**
   * Handle confirmation (e.g. deletion) for a specific item.
   */
  handleConfirmation(props: ConfirmationOperationProps) {
    const {
      confirmationType,
      itemDescription,
      removeQuotes,
      onConfirmationResult,
      onConfirmYes,
    } = props;

    const data: ConfirmationModalContent = {
      confirmationType: confirmationType,
      itemDescription,
      removeQuotes,
    };

    const modalRef = this.dialog.open<
      ConfirmationModalComponent,
      ConfirmationModalContent,
      ConfirmationResult
    >(ConfirmationModalComponent, {
      data,
      autoFocus: '#primary-button',
    });

    const subscription = modalRef.afterClosed().subscribe((res) => {
      if (onConfirmationResult) {
        onConfirmationResult(res || ConfirmationResult.NO);
      }

      if (res == ConfirmationResult.YES && onConfirmYes) {
        onConfirmYes();
      }

      subscription.unsubscribe();
    });
  }
}
