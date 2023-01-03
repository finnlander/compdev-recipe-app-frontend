import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * Base class for components that subscribe any subscriptions from rxjs.
 */
@Component({
  selector: '',
  template: '',
})
export abstract class SubscribingComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];

  protected addSubscription(subscription: Subscription) {
    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((it) => it.unsubscribe());
    this.subscriptions = [];
  }
}
