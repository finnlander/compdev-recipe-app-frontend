import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
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
        '/ingredients': this.backendMockService.getIngredients,
      })
    ),
    POST: new Map(
      Object.entries({
        '/auth/login': this.backendMockService.login,
        '/auth/signup': this.backendMockService.signup,
        '/ingredients': this.backendMockService.getOrAddIngredients,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const { url } = req;
    const path = url.substring(environment.backendServerBaseUrl.length);

    const method = req.method as 'GET' | 'POST' | 'PUT';
    const respMethodMap = this.urls[method];
    const mockResponseProvider = respMethodMap.get(path);

    if (mockResponseProvider) {
      const res = mockResponseProvider(req);
      console.debug(
        `providing mock response for call [${method}}] ${path}: [${
          res.status
        }]${res.status !== 200 ? ': ' + JSON.stringify(res.body) : ''}`
      );
      return of(res).pipe(delay(100));
    }

    console.log(
      `No mock response for path ${path} (${method}) -> skipping mocking`
    );
    return next.handle(req);
  }
}
