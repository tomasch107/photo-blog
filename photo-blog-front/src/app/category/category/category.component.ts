import {Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {ApiPaginatedResponse, Category} from "../../model/category.model";
import {CategoryService} from "../../services/category.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {Observable, Subscription, switchMap, tap} from "rxjs";
import {Image, Post} from "../../model/image.model";
import {DOCUMENT} from "@angular/common";
import {environment} from "../../../environments/environment";
import {LanguageService} from "../../services/language.service";
import {RenderingService} from "../../services/rendering.service";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit, OnDestroy {
  posts$: Observable<ApiPaginatedResponse<Post>> | undefined;

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private languageService: LanguageService,
    private renderingService: RenderingService
  ) {
  }

  baseUrl = environment.baseUrl;
  subscriptions = new Subscription();
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const categoryCode = params.get('categoryCode');
      if (categoryCode) {
        this.subscriptions.add(
          this.categoryService.getCategoryForCode(categoryCode).subscribe((categories) => {
            const category = categories.data[0];
            this.renderingService.changeBodyBackgroundImage(category?.background);
          })
        )
        this.posts$ = this.languageService.currentLanguage$.pipe(switchMap(() => {
          if (categoryCode.includes('all')) {
            return this.categoryService.getAllImages();
          }
          return this.categoryService.getImagesForCategory(categoryCode);
        })

        )
      }
    })
  }
}
