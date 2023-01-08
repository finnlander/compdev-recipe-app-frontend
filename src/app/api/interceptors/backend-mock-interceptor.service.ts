import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BackendMockService } from '../services/backend-mock.service';

/**
 * Backend server mock implementation that mocks backend calls.
 */
@Injectable()
export class BackendMockInterceptor implements HttpInterceptor {
  urls = {
    GET: new Map(
      Object.entries({
        '/users/me': this.backendMockService.getCurrentUser,
        '/recipes': this.backendMockService.getRecipes,
      })
    ),
    POST: new Map(
      Object.entries({
        '/auth/login': this.backendMockService.login,
        '/auth/signup': this.backendMockService.signup,
      })
    ),
    PUT: new Map(
      Object.entries({
        '/recipes': this.backendMockService.setRecipes,
      })
    ),
  };

  constructor(private backendMockService: BackendMockService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const { url } = req;
    const path = url.substring(environment.backendServerBaseUrl.length);

    const method = req.method as 'GET' | 'POST' | 'PUT';
    const respMethodMap = this.urls[method];
    const mockResponseProvider = respMethodMap.get(path);

    if (mockResponseProvider) {
      return of(mockResponseProvider(req));
    }

    console.log(
      `No mock response for path ${path} (${method}) -> skipping mocking`
    );
    return next.handle(req);
  }
}
