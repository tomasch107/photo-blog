import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {provideTranslateService} from '@ngx-translate/core';

import {MainPageComponent} from './main-page.component';

describe('MainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainPageComponent
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ...provideTranslateService({lang: 'en', fallbackLang: 'en'}),
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build an aspect ratio from image dimensions', () => {
    expect(component.getAspectRatio({width: 1920, height: 1080} as any)).toBe('1920 / 1080');
    expect(component.getAspectRatio(undefined)).toBe('4 / 3');
  });
});
