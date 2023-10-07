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

  page$ = this.languageService.currentLanguage$.pipe(
    switchMap(() => this.pageService.getPageForCode('homepage')),
    tap((page) => {
      this.renderingService.changeBodyBackgroundImage(page.data[0].background);
    })
  )
  constructor(private languageService: LanguageService, private pageService: PageService, private categoryService: CategoryService, private renderer2: Renderer2,  @Inject(DOCUMENT) private document: Document, private router: Router,    private renderingService: RenderingService
  ) {

  }
}
