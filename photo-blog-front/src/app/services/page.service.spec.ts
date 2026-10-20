import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { PageService } from './page.service';
import { UrlService } from './url.service';

describe('PageService', () => {
  let service: PageService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PageService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request a page by code', () => {
    const urlService = TestBed.inject(UrlService);

    service.getPageForCode('homepage').subscribe();

    const request = httpTesting.expectOne(urlService.getUrl('pages', { code: 'homepage' }));
    expect(request.request.method).toBe('GET');
    request.flush({ data: [], meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } } });
  });
});
