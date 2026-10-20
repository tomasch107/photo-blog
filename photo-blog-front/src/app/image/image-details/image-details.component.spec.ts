import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideMarkdown } from 'ngx-markdown';

import { ImageDetailsComponent } from './image-details.component';
import { ImageModule } from '../image.module';

describe('ImageDetailsComponent', () => {
  let component: ImageDetailsComponent;
  let fixture: ComponentFixture<ImageDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ImageModule,
        RouterTestingModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ...provideTranslateService({ lang: 'en', fallbackLang: 'en' }),
        ...provideMarkdown(),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pad frame indexes to two digits', () => {
    expect(component.formatIndex(1)).toBe('01');
    expect(component.formatIndex(12)).toBe('12');
  });
});
