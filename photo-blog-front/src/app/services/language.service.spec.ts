import { TestBed } from '@angular/core/testing';

import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose the active language as a signal', () => {
    service.changeLanguage('pl');
    expect(service.currentLanguage()).toBe('pl');

    service.changeLanguage('en');
    expect(service.currentLanguage()).toBe('en');
  });

  it('should ignore unsupported languages', () => {
    service.changeLanguage('en');
    service.changeLanguage('de');

    expect(service.currentLanguage()).toBe('en');
  });
});
