import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SubscribingComponent } from './subscribing-component';

/**
 * Base class for components that tracks numeric id value in url path (e.g. record/model based details component).
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '',
  template: '',
})
export abstract class IdPathTrackingComponent
  extends SubscribingComponent
  implements OnInit
{
  private id: string | undefined;

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
  getCurrentId(): string | undefined {
    return this.id;
  }

  abstract onCurrentIdChanged(currentId: string | undefined): void;
}

/**
 * Extract 'id' from router path params.
 */
function getIdFromPathParams(params: Params): string | undefined {
  const id = params['id'];
  if (!id) {
    return undefined;
  }

  return id;
}
