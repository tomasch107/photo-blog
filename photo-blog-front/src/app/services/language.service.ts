import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  static readonly languageStorageKey = 'lang';
  static readonly supportedLanguages = ['en', 'pl'];

  private readonly language = signal(LanguageService.resolveLanguage());
  readonly currentLanguage = this.language.asReadonly();

  public changeLanguage(languageIsoCode: string) {
    if (!LanguageService.supportedLanguages.includes(languageIsoCode)) {
      return;
    }

    localStorage.setItem(LanguageService.languageStorageKey, languageIsoCode);
    this.language.set(languageIsoCode);
  }

  private static resolveLanguage(): string {
    const stored = localStorage.getItem(LanguageService.languageStorageKey);
    const browser = window.navigator.language.slice(0, 2);
    const candidate = stored ?? browser;

    return LanguageService.supportedLanguages.includes(candidate) ? candidate : 'en';
  }
}
