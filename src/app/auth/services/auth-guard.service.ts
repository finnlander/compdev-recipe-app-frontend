import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, skipWhile, switchMap } from 'rxjs/operators';
import { RoutePath } from '../../config/routes.config';
import { RootState } from '../../store/app.store';
import { authSelectors } from '../store';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  isAuthenticated = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private store: Store<RootState>
  ) {
    store
      .select(authSelectors.isAuthenticated)
      .subscribe((isAuthenticated) => (this.isAuthenticated = isAuthenticated));
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.authService.afterInitialized().pipe(
      switchMap(() => {
        // make sure to wait until there is no pending authentication operations ongoing
        return this.store.select(authSelectors.isPendingAuthentication).pipe(
          skipWhile((isPending) => isPending),
          map(() => {
            if (this.isAuthenticated) {
              return true;
            }

            // redirect to login
            return this.router.createUrlTree([RoutePath.Auth], {
              queryParams: { returnUrl: state.url },
            });
          })
        );
      })
    );
  }
}
