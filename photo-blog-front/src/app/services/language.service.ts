import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  static readonly languageStorageKey = 'lang';

  currentLanguage$ = new BehaviorSubject(localStorage.getItem(LanguageService.languageStorageKey) ?? 'en')
  constructor() { }

  public changeLanguage(languageIsoCode: string) {
    localStorage.setItem(LanguageService.languageStorageKey, languageIsoCode);
    this.currentLanguage$.next(languageIsoCode);
  }
}
