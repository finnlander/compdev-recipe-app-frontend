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
import { map } from 'rxjs/operators';
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
    return this.authService.getAuthTokenOnce().pipe(
      map((authToken) => {
        if (authToken) {
          // is authenticated
          return true;
        }

        // redirect to login
        return this.router.createUrlTree([RoutePath.Auth], {
          queryParams: { returnUrl: state.url },
        });
      })
    );
  }
}
