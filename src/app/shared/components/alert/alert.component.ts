import { Component, EventEmitter, Input, Output } from '@angular/core';

export type AlertType = 'error' | 'info' | 'warning';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent {
  @Input() type: AlertType = 'error';
  @Input()
  action?: string;
  @Input() message?: string | null;
  @Output() dismiss = new EventEmitter<void>();

  onDismissClick() {
    this.dismiss.emit();
  }
}
