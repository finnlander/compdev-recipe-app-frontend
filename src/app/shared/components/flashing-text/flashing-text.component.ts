import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

/**
 * Component that flashes the text when it is changed.
 */
@Component({
  selector: 'app-flashing-text',
  template: `
    <div style="display:inline-block" [ngClass]="state" [@block]="state">
      {{ text }}
    </div>
  `,
  animations: [
    trigger('block', [
      state(
        'state1',
        style({
          color: 'black',
          opacity: 1,
        })
      ),
      state(
        'state2',
        style({
          color: 'black',
          opacity: 1,
        })
      ),
      transition('state1 <=> state2', [
        animate(
          1000,
          keyframes([
            style({
              opacity: 0.75,
              color: 'black',
            }),
            style({
              opacity: 0.3,
              color: 'gray',
            }),
            style({
              opacity: 0.75,
              color: 'black',
            }),
          ])
        ),
      ]),
    ]),
  ],
})
export class FlashingTextComponent implements OnChanges {
  @Input() text: string | number = '';

  state: 'state1' | 'state2' = 'state1';

  ngOnChanges(changes: SimpleChanges): void {
    this.state = this.state === 'state1' ? 'state2' : 'state1';
  }
}
