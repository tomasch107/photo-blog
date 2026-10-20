import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {LanguageService} from './language.service';

export const languageInterceptor: HttpInterceptorFn = (request, next) => {
  const language = inject(LanguageService).currentLanguage() || 'en';

  return next(request.clone({
    setParams: {
      locale: language
    }
  }));
};
