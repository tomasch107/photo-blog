import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideMarkdown } from 'ngx-markdown';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { languageInterceptor } from './app/services/language.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes, withInMemoryScrolling({scrollPositionRestoration: 'enabled'})),
    provideHttpClient(withInterceptors([languageInterceptor])),
    ...provideTranslateService({lang: 'en', fallbackLang: 'en'}),
    ...provideTranslateHttpLoader({prefix: './assets/i18n/', suffix: '.json'}),
    provideMarkdown(),
  ],
}).catch((error) => console.error(error));
