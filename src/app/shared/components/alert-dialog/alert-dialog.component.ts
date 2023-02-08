import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export type AlertType = 'error' | 'info' | 'warning';

export interface AlertDialogData {
  type: AlertType;
  action?: string;
  message?: string | null;
}

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css'],
})
export class AlertDialogComponent {
  @Input() type: AlertType = 'error';
  @Input()
  action?: string;
  @Input() message?: string | null;

  constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlertDialogData
  ) {}

  onDismissClick() {
    this.dialogRef.close();
  }
}
