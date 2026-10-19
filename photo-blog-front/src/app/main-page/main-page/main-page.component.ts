import {Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {Observable, Subscription, switchMap, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CategoryService} from "../../services/category.service";
import {ApiPaginatedResponse, Category} from "../../model/category.model";
import {Image, Page, Post} from "../../model/image.model";
import {DOCUMENT} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {RenderingService} from "../../services/rendering.service";
import {PageService} from "../../services/page.service";
import {LanguageService} from "../../services/language.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, OnDestroy {

  languageCode = 'en';

  recentPosts: Post[] = [];
  totalFrames = 0;

  private subscriptions = new Subscription();
  baseUrl = environment.baseUrl;

  page$ = this.languageService.currentLanguage$.pipe(
    tap((language) => this.languageCode = language),
    switchMap(() => this.pageService.getPageForCode('homepage'))
  )

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
    return this.languageCode === 'pl' ? 'Przeglądaj kadry' : 'Browse the frames';
  }

  get recentLabel(): string {
    return this.languageCode === 'pl' ? 'Ostatnie kadry' : 'Latest frames';
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

  constructor(private languageService: LanguageService, private pageService: PageService, private categoryService: CategoryService, private renderer2: Renderer2,  @Inject(DOCUMENT) private document: Document, private router: Router,    private renderingService: RenderingService
  ) {

  }

  ngOnInit() {
    this.subscriptions.add(
      this.languageService.currentLanguage$.pipe(
        tap((language) => this.languageCode = language),
        switchMap(() => this.categoryService.getAllImages(1, 6))
      ).subscribe((posts) => {
        this.totalFrames = posts.meta?.pagination?.total ?? 0;
        this.recentPosts = posts.data.filter((post) => !!this.getPostImage(post)).slice(0, 3);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
