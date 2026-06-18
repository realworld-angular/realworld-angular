import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withExperimentalAutoCleanupInjectors,
  withInMemoryScrolling,
} from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { Auth } from './core/services/auth';
import { baseUrlInterceptor } from './core/interceptors/base-url.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding({ unmatchedInputBehavior: 'undefinedIfStale' }),
      withExperimentalAutoCleanupInjectors(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideHttpClient(withInterceptors([baseUrlInterceptor, credentialsInterceptor]), withFetch()),
    provideAppInitializer(() => inject(Auth).init()),
  ],
};
