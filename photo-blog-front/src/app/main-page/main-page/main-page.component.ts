import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {Observable, switchMap, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CategoryService} from "../../services/category.service";
import {ApiPaginatedResponse, Category} from "../../model/category.model";
import {DOCUMENT} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {RenderingService} from "../../services/rendering.service";
import {PageService} from "../../services/page.service";
import {LanguageService} from "../../services/language.service";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {

  languageCode = 'en';

  page$ = this.languageService.currentLanguage$.pipe(
    tap((language) => this.languageCode = language),
    switchMap(() => this.pageService.getPageForCode('homepage')),
    tap((page) => {
      this.renderingService.changeBodyBackgroundImage(page.data[0]?.background);
    })
  )

  get heroEyebrow(): string {
    return this.languageCode === 'pl'
      ? 'Opowieści z nocnego nieba'
      : 'Stories from the night sky';
  }

  get heroCaption(): string {
    return this.languageCode === 'pl'
      ? 'Kosmos widziany z Ziemi'
      : 'The cosmos, seen from Earth';
  }

  get heroMeta(): string[] {
    return this.languageCode === 'pl'
      ? ['Mgławice', 'Galaktyki', 'Nocne krajobrazy']
      : ['Nebulae', 'Galaxies', 'Nightscapes'];
  }

  get scrollLabel(): string {
    return this.languageCode === 'pl' ? 'Przewiń' : 'Scroll';
  }

  constructor(private languageService: LanguageService, private pageService: PageService, private categoryService: CategoryService, private renderer2: Renderer2,  @Inject(DOCUMENT) private document: Document, private router: Router,    private renderingService: RenderingService
  ) {

  }
}
