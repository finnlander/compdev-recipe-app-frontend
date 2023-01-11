import {
  CUSTOM_ELEMENTS_SCHEMA,
  EnvironmentProviders,
  NgModule,
  Provider,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { AuthInterceptor } from './api/interceptors/auth-interceptor.service';
import { BackendMockInterceptor } from './api/interceptors/backend-mock-interceptor.service';
import { ErrorInterceptor } from './api/interceptors/error-interceptor.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { HeaderComponent } from './header/header.component';
import { SharedModule } from './shared/shared.module';

const providers: (Provider | EnvironmentProviders)[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true,
  },
];

if (environment.enableBackendMock) {
  console.info('Enabling backend mocking');
  providers.push({
    provide: HTTP_INTERCEPTORS,
    useClass: BackendMockInterceptor,
    multi: true,
  });
}

@NgModule({
  declarations: [AppComponent, HeaderComponent, ErrorPageComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
    // note: AppRoutingModule needs to be the last import to keep the wildcard (default) route as the last evaluated route
    AppRoutingModule,
  ],
  providers: providers,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
