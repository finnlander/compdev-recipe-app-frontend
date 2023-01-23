import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { RootState } from '../../store/app.store';

/**
 * Http request interceptor that adds authorization header for basic authentication.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private store: Store<RootState>,
    private authService: AuthService
  ) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!requiresAuthenticationHeader(req)) {
      return next.handle(req);
    }

    return this.authService.getAuthTokenOnce().pipe(
      switchMap((authToken) => {
        if (!authToken) {
          return next.handle(req);
        }

        const authHeaderValue = generateAuthHeader(authToken);
        const modifiedReq = req.clone({
          headers: req.headers.append('Authorization', authHeaderValue),
        });

        return next.handle(modifiedReq);
      })
    );
  }
}

/* Helper Functions */

function generateAuthHeader(token: string): string {
  return `Bearer ${token}`;
}

function requiresAuthenticationHeader(req: HttpRequest<unknown>) {
  const apiPath = req.url.replace(environment.backendServerBaseUrl, '');
  return !apiPath.startsWith('/auth');
}
