import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Http request interceptor that adds authorization header for basic authentication.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authHeaderValue: string = this.authService.getAuthToken()!!;
    if (!authHeaderValue) {
      return next.handle(req);
    }

    const modifiedReq = req.clone({
      headers: req.headers.append('Authorization', authHeaderValue),
    });

    return next.handle(modifiedReq);
  }
}
