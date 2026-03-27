import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const translateModuleConfig = {
  loader: {
    provide: TranslateLoader,
    useClass: TranslateHttpLoader,
  },
  defaultLanguage: 'es',
};

export const translateHttpLoaderProvider = provideTranslateHttpLoader({
  prefix: './assets/i18n/',
  suffix: '.json',
});
