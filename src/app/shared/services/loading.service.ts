import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

/**
 * Wrapper service for providing loading spinner.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  constructor(private spinner: NgxSpinnerService) {}

  showSpinner() {
    this.spinner.show();
  }

  hideSpinner() {
    this.spinner.hide();
  }
}
