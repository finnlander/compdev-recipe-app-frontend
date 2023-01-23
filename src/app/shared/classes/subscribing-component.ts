import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * Base class for components that subscribe any subscriptions from rxjs.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '',
  template: '',
})
export abstract class SubscribingComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];
  private timeouts: ReturnType<typeof setTimeout>[] = [];

  protected addSubscription(subscription: Subscription) {
    this.subscriptions.push(subscription);
  }

  protected addTimeout(timeMs: number, callback: () => void) {
    const index = this.timeouts.length;
    this.timeouts.push(
      setTimeout(() => {
        callback();
        this.timeouts.splice(index, 1);
      }, timeMs)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((it) => it.unsubscribe());
    this.subscriptions = [];

    this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.timeouts = [];
  }
}
