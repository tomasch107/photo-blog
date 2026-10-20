import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {catchError, combineLatest, of, startWith, Subject, Subscription, switchMap, tap} from "rxjs";
import {CategoryService} from "../../services/category.service";
import {Image, Page, Post} from "../../model/image.model";
import {PageService} from "../../services/page.service";
import {LanguageService} from "../../services/language.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager
})
export class MainPageComponent implements OnInit, OnDestroy {

  recentPosts: Post[] = [];
  recentLoaded = false;
  recentError = false;
  pageLoadFailed = false;
  totalFrames = 0;
  skeletonItems = [1, 2, 3];
  heroSubjectKeys = [
    'main.heroSubjects.nebulae',
    'main.heroSubjects.galaxies',
    'main.heroSubjects.nightscapes'
  ];

  private subscriptions = new Subscription();
  private recentSubscription?: Subscription;
  private pageRetry$ = new Subject<void>();
  baseUrl = environment.baseUrl;

  page$ = combineLatest([
    this.languageService.currentLanguage$,
    this.pageRetry$.pipe(startWith(undefined))
  ]).pipe(
    tap(() => {
      this.pageLoadFailed = false;
    }),
    switchMap(() => this.pageService.getPageForCode('homepage').pipe(
      catchError(() => {
        this.pageLoadFailed = true;
        return of(null);
      })
    ))
  );

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

  private firstImage(post: Post): Image | undefined {
    return post.thumbnail || post.images?.[0];
  }

  constructor(
    private languageService: LanguageService,
    private pageService: PageService,
    private categoryService: CategoryService
  ) {
  }

  ngOnInit() {
    this.loadRecentPosts();
  }

  retryPage() {
    this.pageLoadFailed = false;
    this.pageRetry$.next();

    if (this.recentError) {
      this.loadRecentPosts();
    }
  }

  retryRecent() {
    this.loadRecentPosts();
  }

  private loadRecentPosts() {
    this.recentLoaded = false;
    this.recentError = false;
    this.recentSubscription?.unsubscribe();

    this.recentSubscription = this.languageService.currentLanguage$.pipe(
      switchMap(() => this.categoryService.getAllImages(1, 6))
    ).subscribe({
      next: (posts) => {
        this.totalFrames = posts.meta?.pagination?.total ?? 0;
        this.recentPosts = posts.data.filter((post) => !!this.getPostImage(post)).slice(0, 3);
        this.recentError = false;
        this.recentLoaded = true;
      },
      error: () => {
        this.recentLoaded = true;
        this.recentError = true;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.recentSubscription?.unsubscribe();
  }
}
