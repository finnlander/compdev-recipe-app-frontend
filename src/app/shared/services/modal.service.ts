import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
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
  constructor(private bsModalService: BsModalService) {}

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

    const initialState: ConfirmationModalContent = {
      confirmationType: confirmationType,
      itemDescription,
      removeQuotes,
    };

    const modalRef = this.bsModalService.show(ConfirmationModalComponent, {
      initialState,
    });

    const modal = modalRef.content as ConfirmationModalComponent;
    const subscription = modal.confirmationResult.subscribe((res) => {
      if (onConfirmationResult) {
        onConfirmationResult(res);
      }

      if (res == ConfirmationResult.YES && onConfirmYes) {
        onConfirmYes();
      }

      subscription.unsubscribe();
    });
  }
}
