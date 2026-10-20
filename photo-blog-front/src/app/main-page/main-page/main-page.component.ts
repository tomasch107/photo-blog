import {DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {catchError, map, of, startWith, switchMap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Image, Page, Post} from '../../model/image.model';
import {CategoryService} from '../../services/category.service';
import {LanguageService} from '../../services/language.service';
import {PageService} from '../../services/page.service';

interface PageState {
  page: Page | null;
  loading: boolean;
  failed: boolean;
}

interface RecentState {
  posts: Post[];
  total: number;
  loaded: boolean;
  failed: boolean;
}

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe
  ]
})
export class MainPageComponent {
  readonly skeletonItems = [1, 2, 3];
  readonly heroSubjectKeys = [
    'main.heroSubjects.nebulae',
    'main.heroSubjects.galaxies',
    'main.heroSubjects.nightscapes'
  ];
  readonly baseUrl = environment.baseUrl;

  private readonly languageService = inject(LanguageService);
  private readonly pageService = inject(PageService);
  private readonly categoryService = inject(CategoryService);

  private readonly pageRetry = signal(0);
  private readonly recentRetry = signal(0);

  private readonly pageRequest = computed(() => ({
    language: this.languageService.currentLanguage(),
    retry: this.pageRetry()
  }));

  private readonly recentRequest = computed(() => ({
    language: this.languageService.currentLanguage(),
    retry: this.recentRetry()
  }));

  readonly pageState = toSignal(
    toObservable(this.pageRequest).pipe(
      switchMap(() => this.pageService.getPageForCode('homepage').pipe(
        map((response): PageState => ({
          page: response.data[0] ?? null,
          loading: false,
          failed: false
        })),
        catchError(() => of<PageState>({page: null, loading: false, failed: true})),
        startWith<PageState>({page: null, loading: true, failed: false})
      ))
    ),
    {initialValue: {page: null, loading: true, failed: false}}
  );

  readonly recentState = toSignal(
    toObservable(this.recentRequest).pipe(
      switchMap(() => this.categoryService.getAllImages(1, 6).pipe(
        map((posts): RecentState => ({
          posts: posts.data.filter((post) => !!this.getPostImage(post)).slice(0, 3),
          total: posts.meta?.pagination?.total ?? 0,
          loaded: true,
          failed: false
        })),
        catchError(() => of<RecentState>({posts: [], total: 0, loaded: true, failed: true})),
        startWith<RecentState>({posts: [], total: 0, loaded: false, failed: false})
      ))
    ),
    {initialValue: {posts: [], total: 0, loaded: false, failed: false}}
  );

  readonly showRecent = computed(() => {
    const state = this.recentState();

    return !state.loaded || state.posts.length > 0 || state.failed;
  });

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

  getCoverUrl(page: Page): string {
    const url = page.background?.formats?.['large']?.url || page.background?.url || '';

    return url ? `${this.baseUrl}${url}` : '';
  }

  getPostImage(post: Post): string {
    const image = this.firstImage(post);
    const url = image?.formats?.['large']?.url || image?.url || '';

    return url ? `${this.baseUrl}${url}` : '';
  }

  getAspectRatio(image?: Image): string {
    const width = Number(image?.width);
    const height = Number(image?.height);

    return width > 0 && height > 0 ? `${width} / ${height}` : '4 / 3';
  }

  retryPage() {
    this.pageRetry.update((value) => value + 1);

    if (this.recentState().failed) {
      this.retryRecent();
    }
  }

  retryRecent() {
    this.recentRetry.update((value) => value + 1);
  }

  private firstImage(post: Post): Image | undefined {
    return post.thumbnail || post.images?.[0];
  }
}
