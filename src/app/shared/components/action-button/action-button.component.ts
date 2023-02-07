import { Component, EventEmitter, Input, Output } from '@angular/core';

type Color = 'basic' | 'primary' | 'accent' | 'warn';

@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.css'],
})
export class ActionButtonComponent {
  @Output() clicked = new EventEmitter<void>();

  @Input() text!: string;
  @Input() icon!: string;
  @Input() color: Color = 'primary';
  @Input() tooltip = '';
  @Input() disabled = false;
  @Input() indent = true;

  onClick() {
    this.clicked.emit();
  }
}
