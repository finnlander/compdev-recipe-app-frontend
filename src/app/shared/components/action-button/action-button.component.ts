import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, EventEmitter, Input, Output } from '@angular/core';

type Color = 'basic' | 'primary' | 'accent' | 'warn';

@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.css'],
})
export class ActionButtonComponent {
  @Output() clicked = new EventEmitter<void>();

  private _disabled = false;
  @Input() get disabled() {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }

  private _indent = true;
  @Input() get indent() {
    return this._indent;
  }
  set indent(value: BooleanInput) {
    this._indent = coerceBooleanProperty(value);
  }

  @Input() text?: string;
  @Input() icon!: string;
  @Input() color: Color = 'primary';
  @Input() tooltip = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  onClick() {
    this.clicked.emit();
  }
}
