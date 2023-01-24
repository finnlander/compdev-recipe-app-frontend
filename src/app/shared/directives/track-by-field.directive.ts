import { NgForOf } from '@angular/common';
import { Directive, Host, Input, NgIterable } from '@angular/core';

/**
 * Directive that allows using simplified 'trackBy' statement in ngFor.
 * The idea is originated from medium article (https://medium.com/@ingobrk/here-is-how-you-can-use-trackby-with-a-property-name-ec3bbba8fa75)
 * written by Ingo Bürk.
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[ngForTrackByField]',
})
export class TrackByFieldDirective<T> {
  /**
   * Input to support Typescript compiler type safety functionality.
   */
  @Input() ngForOf!: NgIterable<T>;
  @Input()
  public ngForTrackByField!: keyof T;

  constructor(@Host() private ngFor: NgForOf<T>) {
    this.ngFor.ngForTrackBy = (_index: number, item: T): T[keyof T] =>
      item[this.ngForTrackByField];
  }
}
