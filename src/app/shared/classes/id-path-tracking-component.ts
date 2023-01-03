import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getIdFromPathParams } from '../utils/common.util';
import { SubscribingComponent } from './subscribing-component';

/**
 * Base class for components that tracks numeric id value in url path (e.g. record/model based details component).
 */
@Component({
  selector: '',
  template: '',
})
export abstract class IdPathTrackingComponent
  extends SubscribingComponent
  implements OnInit
{
  private id: number | undefined;

  constructor(protected route: ActivatedRoute) {
    super();
  }

  ngOnInit(): void {
    this.id = getIdFromPathParams(this.route.snapshot.params);

    this.addSubscription(
      this.route.params.subscribe((params) => {
        const id = getIdFromPathParams(params);
        if (id !== this.id) {
          this.id = id;
          this.onCurrentIdChanged(id);
        }
      })
    );

    // trigger once manually for allowing component initialization
    this.onCurrentIdChanged(this.id);
  }

  /**
   * Get current 'id' extracted from the current path; returns 'undefined' if the id value is not numeric.
   */
  getCurrentId(): number | undefined {
    return this.id;
  }

  abstract onCurrentIdChanged(currentId: number | undefined): void;
}
