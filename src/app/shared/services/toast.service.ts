import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export interface ToastProps {
  title: string;
  message: string;
}

/**
 * Service for handling UI feedback messages.
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  /**
   * Show success toast.
   */
  success(props: ToastProps) {
    const { message, title } = props;
    this.toastr.success(message, title);
  }

  /**
   * Show error toast.
   */
  error(props: ToastProps) {
    const { message, title } = props;
    this.toastr.error(message, title);
  }
}
