import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { languageInterceptor } from './language.interceptor';
import { LanguageService } from './language.service';

describe('languageInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let languageService: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([languageInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    languageService = TestBed.inject(LanguageService);
  });

  afterEach(() => httpTesting.verify());

  it('adds the active locale to outgoing requests', () => {
    languageService.changeLanguage('pl');

    httpClient.get('/api/posts').subscribe();

    const request = httpTesting.expectOne('/api/posts?locale=pl');
    expect(request.request.method).toBe('GET');
    request.flush({});
  });
});
