import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  static readonly languageStorageKey = 'lang';
  static readonly supportedLanguages = ['en', 'pl'];

  currentLanguage$ = new BehaviorSubject(LanguageService.resolveLanguage());
  constructor() { }

  public changeLanguage(languageIsoCode: string) {
    if (!LanguageService.supportedLanguages.includes(languageIsoCode)) {
      return;
    }

    localStorage.setItem(LanguageService.languageStorageKey, languageIsoCode);
    this.currentLanguage$.next(languageIsoCode);
  }

  private static resolveLanguage(): string {
    const stored = localStorage.getItem(LanguageService.languageStorageKey);
    const browser = window.navigator.language.slice(0, 2);
    const candidate = stored ?? browser;

    return LanguageService.supportedLanguages.includes(candidate) ? candidate : 'en';
  }
}
