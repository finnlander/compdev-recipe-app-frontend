import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { authActions } from '../../auth/store';
import { RootState } from '../../store/app.store';

/**
 * API error interceptor that handles logging out, if request is unauthorized.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private store: Store<RootState>) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err) => {
        if (err.status === 401) {
          console.debug(
            'API returned code "401" -> logging out. Url: ',
            req.url,
            'Auth header:',
            req.headers.get('Authorization')
          );
          this.store.dispatch(authActions.logout({}));
        }

        return throwError(err);
      })
    );
  }
}
