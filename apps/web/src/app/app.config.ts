import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { retryInterceptor } from './core/interceptors/retry.interceptor';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withPreloading(PreloadAllModules), withViewTransitions()),
    provideHttpClient(withInterceptors([retryInterceptor])),
    provideAnimationsAsync(),
    ...TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
      defaultLanguage: 'es',
    }).providers!,
  ],
};
