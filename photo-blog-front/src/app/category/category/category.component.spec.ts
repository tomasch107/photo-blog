import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {provideTranslateService} from '@ngx-translate/core';

import {CategoryComponent} from './category.component';

describe('CategoryComponent', () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CategoryComponent
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ...provideTranslateService({lang: 'en', fallbackLang: 'en'}),
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select the correct plural key for frame counts', () => {
    expect(component.getFramesCountKey(1)).toBe('units.frames.one');
    expect(component.getFramesCountKey(3)).toBe('units.frames.few');
    expect(component.getFramesCountKey(5)).toBe('units.frames.many');
  });
});
