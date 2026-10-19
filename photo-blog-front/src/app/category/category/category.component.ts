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
  categoryName = '';
  totalCount = 0;
  loading = true;
  endOfList = true;
  skeletonItems = [1, 2, 3, 4, 5, 6];

  get collectionLabel(): string {
    return this.languageCode === 'pl' ? 'Kolekcja' : 'Collection';
  }

  getFramesLabel(count: number): string {
    if (this.languageCode !== 'pl') {
      return count === 1 ? 'frame' : 'frames';
    }

    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (count === 1) {
      return 'kadr';
    }

    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
      return 'kadry';
    }

    return 'kadrów';
  }

  get viewFrameLabel(): string {
    return this.languageCode === 'pl' ? 'Zobacz kadr' : 'View frame';
  }

  get allCapturesLabel(): string {
    return this.languageCode === 'pl' ? 'Wszystkie kadry' : 'All captures';
  }

  get loadMoreLabel(): string {
    return this.languageCode === 'pl' ? 'Załaduj więcej' : 'Load more';
  }

  get endLabel(): string {
    return this.languageCode === 'pl' ? 'Koniec kolekcji' : 'End of collection';
  }

  get emptyLabel(): string {
    return this.languageCode === 'pl'
      ? 'Ta kolekcja jest jeszcze pusta. Wróć wkrótce.'
      : 'This collection is still empty. Check back soon.';
  }

  getPostImage(post: Post): string {
    const image = post.thumbnail || post.images?.[0];
    const url = image?.formats?.['medium']?.url || image?.url || '';

    return url ? `${this.baseUrl}${url}` : '';
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ngOnInit() {
    this.subscriptions.add(
      combineLatest([this.languageService.currentLanguage$, this.route.paramMap]).subscribe(([language, params]) => {
        this.languageCode = language;
        this.categoryCode = params.get('categoryCode');
        this.categoryName = '';

        if (this.categoryCode) {
          const categoryCode = this.categoryCode;
          this.subscriptions.add(
            this.categoryService.getCategoryForCode(categoryCode).subscribe((categories) => {
              if (this.categoryCode !== categoryCode) {
                return;
              }

              const category = categories.data[0];
              this.categoryName = category?.name
                ?? (categoryCode.includes('all') ? this.allCapturesLabel : '');
              this.renderingService.changeBodyBackgroundImage(category?.background);
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

    this.subscriptions.add(this.languageService.currentLanguage$.pipe(take(1), switchMap((language) => {
          this.languageCode = language;
          if (categoryCode.includes('all')) {
            return this.categoryService.getAllImages(this.currentPage, this.pageSize);
          }
          return this.categoryService.getImagesForCategory(categoryCode, this.currentPage, this.pageSize);
        })
      ).subscribe({
        next: data => {
          this.currentPage++;
          this.posts?.push(...data.data)
          this.totalCount = data.meta.pagination.total;
          this.endOfList = this.posts.length >= this.totalCount;
          this.loading = false;
        },
        error: () => {
          this.totalCount = 0;
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
}
