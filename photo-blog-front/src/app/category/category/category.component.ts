import {DatePipe} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {InfiniteScrollDirective} from 'ngx-infinite-scroll';
import {Observable, Subscription, catchError, map, of, startWith, switchMap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ApiPaginatedResponse} from '../../model/category.model';
import {Image, Post} from '../../model/image.model';
import {CategoryService} from '../../services/category.service';
import {LanguageService} from '../../services/language.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    InfiniteScrollDirective,
    RouterLink,
    TranslatePipe
  ]
})
export class CategoryComponent {
  readonly pageSize = 12;
  readonly skeletonItems = [1, 2, 3, 4, 5, 6];
  readonly baseUrl = environment.baseUrl;

  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly languageService = inject(LanguageService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categoryCode = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('categoryCode'))),
    {initialValue: null}
  );

  readonly posts = signal<Post[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly totalCount = signal(0);
  readonly endOfList = signal(true);

  private readonly currentPage = signal(1);
  private loadToken = 0;
  private loadSubscription?: Subscription;

  readonly categoryName = toSignal(
    toObservable(computed(() => ({
      code: this.categoryCode(),
      language: this.languageService.currentLanguage()
    }))).pipe(
      switchMap(({code}) => this.resolveCategoryName(code).pipe(startWith('')))
    ),
    {initialValue: ''}
  );

  // Posts are sorted by date (newest first), so the head of the list is the
  // most recent capture and becomes the cover at the top of the category.
  readonly coverPost = computed(() => this.posts()[0]);

  // The cover already shows the newest capture; keep it out of the grid so the
  // same frame is not listed twice.
  readonly gridPosts = computed(() => this.posts().slice(1));

  readonly showSkeleton = computed(() => this.loading() && !this.posts().length);

  readonly statusKey = computed(() => {
    if (this.showSkeleton()) {
      return 'category.loading';
    }

    if (this.loadError()) {
      return 'category.error';
    }

    if (!this.loading() && !this.posts().length) {
      return 'category.empty';
    }

    return '';
  });

  constructor() {
    effect(() => {
      const request = {
        code: this.categoryCode(),
        language: this.languageService.currentLanguage()
      };

      untracked(() => this.startCategory(request.code));
    });

    this.destroyRef.onDestroy(() => this.loadSubscription?.unsubscribe());
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

  onScroll() {
    this.loadMore();
  }

  loadMore() {
    const code = this.categoryCode();

    if (code && !this.loading() && !this.endOfList()) {
      this.loadPage(code, this.currentPage());
    }
  }

  retry() {
    const code = this.categoryCode();

    if (code) {
      this.loadPage(code, this.currentPage());
    }
  }

  private firstImage(post: Post): Image | undefined {
    return post.thumbnail || post.images?.[0];
  }

  private startCategory(code: string | null) {
    this.loadSubscription?.unsubscribe();
    this.loadToken++;
    this.posts.set([]);
    this.totalCount.set(0);
    this.currentPage.set(1);
    this.loadError.set(false);
    this.endOfList.set(false);

    if (!code) {
      this.loading.set(false);
      return;
    }

    this.loadPage(code, 1);
  }

  private loadPage(code: string, page: number) {
    this.loading.set(true);
    this.loadError.set(false);
    const token = ++this.loadToken;

    this.loadSubscription?.unsubscribe();
    this.loadSubscription = this.fetchPage(code, page).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        if (token !== this.loadToken) {
          return;
        }

        this.currentPage.set(page + 1);
        this.posts.update((posts) => [...posts, ...data.data]);
        this.totalCount.set(data.meta.pagination.total);
        this.endOfList.set(this.posts().length >= this.totalCount());
        this.loading.set(false);
      },
      error: () => {
        if (token !== this.loadToken) {
          return;
        }

        this.loadError.set(true);
        this.endOfList.set(true);
        this.loading.set(false);
      }
    });
  }

  private fetchPage(code: string, page: number): Observable<ApiPaginatedResponse<Post>> {
    if (code.includes('all')) {
      return this.categoryService.getAllImages(page, this.pageSize);
    }

    return this.categoryService.getImagesForCategory(code, page, this.pageSize);
  }

  private resolveCategoryName(code: string | null): Observable<string> {
    if (!code) {
      return of('');
    }

    return this.categoryService.getCategoryForCode(code).pipe(
      map((categories) => categories.data[0]?.name ?? ''),
      switchMap((name) => {
        if (name) {
          return of(name);
        }

        if (code.includes('all')) {
          return this.translate.get('category.all').pipe(map((label) => String(label)));
        }

        return of('');
      }),
      catchError(() => of(''))
    );
  }
}
