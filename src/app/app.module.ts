import {
  CUSTOM_ELEMENTS_SCHEMA,
  EnvironmentProviders,
  NgModule,
  Provider, isDevMode,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { AuthInterceptor } from './api/interceptors/auth-interceptor.service';
import { BackendMockInterceptor } from './api/interceptors/backend-mock-interceptor.service';
import { ErrorInterceptor } from './api/interceptors/error-interceptor.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { HeaderComponent } from './header/header.component';
import { SharedModule } from './shared/shared.module';
import { effects, reducers } from './store/app.store';
import { ServiceWorkerModule } from '@angular/service-worker';

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
    // Angular modules
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    StoreModule.forRoot(reducers),
    StoreDevtoolsModule.instrument({ logOnly: environment.production }),
    EffectsModule.forRoot(effects),
    // App modules
    SharedModule,
    // note: AppRoutingModule needs to be the last import to keep the wildcard (default) route as the last evaluated route
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: providers,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
