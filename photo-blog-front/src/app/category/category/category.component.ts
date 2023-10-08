import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {CategoryService} from "../../services/category.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {combineLatest, Subscription, switchMap, take} from "rxjs";
import {Post} from "../../model/image.model";
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
  pageSize = 25;
  currentPage = 1;

  posts: Post[] = [];

  languageCode = 'en';

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private languageService: LanguageService,
    private renderingService: RenderingService,
    private cd: ChangeDetectorRef
  ) {
  }

  baseUrl = environment.baseUrl;
  subscriptions = new Subscription();
  categoryCode: string | null = '';
  endOfList = true;


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ngOnInit() {
    this.subscriptions.add(
      combineLatest([this.languageService.currentLanguage$, this.route.paramMap]).subscribe(([language, params]) => {
        this.categoryCode = params.get('categoryCode');
        if (this.categoryCode) {
          this.subscriptions.add(
            this.categoryService.getCategoryForCode(this.categoryCode).subscribe((categories) => {
              const category = categories.data[0];
              this.renderingService.changeBodyBackgroundImage(category?.background);
            })
          )
          this.posts = [];
          this.currentPage = 1;
          this.loadPosts(this.categoryCode);
        }
      })
    )
  }

  private loadPosts(categoryCode: string) {
    this.subscriptions.add(this.languageService.currentLanguage$.pipe(take(1), switchMap((language) => {
          this.languageCode = language;
          if (categoryCode.includes('all')) {
            return this.categoryService.getAllImages(this.currentPage, this.pageSize);
          }
          return this.categoryService.getImagesForCategory(categoryCode, this.currentPage, this.pageSize);
        })
      ).subscribe(data => {
        this.currentPage++;
        this.posts?.push(...data.data)
        this.endOfList = this.posts.length >= data.meta.pagination.total;
      })
    )
  }

  onScroll() {
    if (this.categoryCode && !this.endOfList) {
      this.loadPosts(this.categoryCode);
    }
  }

  loadMore() {
    if (this.categoryCode && !this.endOfList) {
      this.loadPosts(this.categoryCode);
    }
  }
}
