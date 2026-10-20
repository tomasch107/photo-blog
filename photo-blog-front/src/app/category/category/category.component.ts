import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {CategoryService} from "../../services/category.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {combineLatest, catchError, of, Subscription, switchMap, take} from "rxjs";
import {Post, Image} from "../../model/image.model";
import {DOCUMENT} from "@angular/common";
import {environment} from "../../../environments/environment";
import {LanguageService} from "../../services/language.service";
import {RenderingService} from "../../services/rendering.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit, OnDestroy {
  pageSize = 12;
  currentPage = 1;

  posts: Post[] = [];

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private languageService: LanguageService,
    private renderingService: RenderingService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {
  }

  baseUrl = environment.baseUrl;
  subscriptions = new Subscription();
  categoryCode: string | null = '';
  categoryName = '';
  totalCount = 0;
  loading = true;
  loadError = false;
  endOfList = true;
  skeletonItems = [1, 2, 3, 4, 5, 6];
  private loadToken = 0;

  // Posts are sorted by date (newest first), so the head of the list is the
  // most recent capture and becomes the cover at the top of the category.
  get coverPost(): Post | undefined {
    return this.posts[0];
  }

  // The cover already shows the newest capture; keep it out of the grid so the
  // same frame is not listed twice.
  get gridPosts(): Post[] {
    return this.posts.slice(1);
  }

  getFramesCountKey(count: number): string {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (count === 1) {
      return 'units.frames.one';
    }

    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
      return 'units.frames.few';
    }

    return 'units.frames.many';
  }

  get showSkeleton(): boolean {
    return this.loading && !this.posts.length;
  }

  get statusKey(): string {
    if (this.showSkeleton) {
      return 'category.loading';
    }

    if (this.loadError) {
      return 'category.error';
    }

    if (!this.loading && !this.posts.length) {
      return 'category.empty';
    }

    return '';
  }

  getPostImage(post: Post): string {
    const image = this.firstImage(post);
    const url = image?.formats?.['medium']?.url || image?.url || '';

    return url ? `${this.baseUrl}${url}` : '';
  }

  getCoverImage(post: Post): string {
    const image = this.firstImage(post);
    const url = image?.formats?.['large']?.url || image?.url || '';

    return url ? `${this.baseUrl}${url}` : '';
  }

  private firstImage(post: Post): Image | undefined {
    return post.thumbnail || post.images?.[0];
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ngOnInit() {
    this.subscriptions.add(
      combineLatest([this.languageService.currentLanguage$, this.route.paramMap]).subscribe(([, params]) => {
        this.categoryCode = params.get('categoryCode');
        this.categoryName = '';
        this.loadError = false;

        if (this.categoryCode) {
          const categoryCode = this.categoryCode;
          this.subscriptions.add(
            this.categoryService.getCategoryForCode(categoryCode).pipe(
              catchError(() => of(null))
            ).subscribe((categories) => {
              if (this.categoryCode !== categoryCode) {
                return;
              }

              const category = categories?.data[0];

              if (category?.name) {
                this.categoryName = category.name;
                return;
              }

              if (categoryCode.includes('all')) {
                this.subscriptions.add(
                  this.translate.get('category.all').subscribe((label) => {
                    if (this.categoryCode === categoryCode) {
                      this.categoryName = label;
                    }
                  })
                );
              }
            })
          )
          this.posts = [];
          this.totalCount = 0;
          this.currentPage = 1;
          this.endOfList = false;
          this.loadPosts(this.categoryCode);
        }
      })
    )
  }

  private loadPosts(categoryCode: string) {
    this.loading = true;
    this.loadError = false;
    const token = ++this.loadToken;

    this.subscriptions.add(this.languageService.currentLanguage$.pipe(take(1), switchMap(() => {
          if (categoryCode.includes('all')) {
            return this.categoryService.getAllImages(this.currentPage, this.pageSize);
          }
          return this.categoryService.getImagesForCategory(categoryCode, this.currentPage, this.pageSize);
        })
      ).subscribe({
        next: data => {
          if (token !== this.loadToken) {
            return;
          }

          this.currentPage++;
          this.posts?.push(...data.data)
          this.totalCount = data.meta.pagination.total;
          this.endOfList = this.posts.length >= this.totalCount;
          this.loading = false;
        },
        error: () => {
          if (token !== this.loadToken) {
            return;
          }

          this.loadError = true;
          this.endOfList = true;
          this.loading = false;
        }
      })
    )
  }

  onScroll() {
    if (this.categoryCode && !this.loading && !this.endOfList) {
      this.loadPosts(this.categoryCode);
    }
  }

  loadMore() {
    if (this.categoryCode && !this.loading && !this.endOfList) {
      this.loadPosts(this.categoryCode);
    }
  }

  retry() {
    if (this.categoryCode) {
      this.loadPosts(this.categoryCode);
    }
  }
}
