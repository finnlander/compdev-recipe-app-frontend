import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoutePath } from '../../config/routes.config';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.authService.afterInitialized().pipe(
      map(() => {
        if (this.authService.isLoggedIn()) {
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
