import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {LanguageService} from "./language.service";

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {

  constructor(private languageService: LanguageService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const language = this.languageService.currentLanguage$.value || 'en'

    request = request.clone({
      setParams: {
        locale: language
      }
    });
    return next.handle(request);
  }
}
