import {Component, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CategoryService} from "../../services/category.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {DOCUMENT} from "@angular/common";
import {environment} from "../../../environments/environment";
import {Observable, pipe, Subscription, switchMap, tap} from "rxjs";
import {Image, Post} from "../../model/image.model";
import {ApiPaginatedResponse} from "../../model/category.model";
import {ImageService} from "../service/image.service";
import {MarkdownService} from "ngx-markdown";
import {PhotoswipeComponent} from "../photoswipe/photoswipe.component";
import {LanguageService} from "../../services/language.service";
import {RenderingService} from "../../services/rendering.service";

@Component({
  selector: 'app-image-details',
  templateUrl: './image-details.component.html',
  styleUrls: ['./image-details.component.scss']
})
export class ImageDetailsComponent implements OnInit {
  @ViewChild('photoSwipe') photoSwipe: PhotoswipeComponent | undefined;

  posts$: Observable<ApiPaginatedResponse<Post>> | undefined;
  languageCode = 'en';
  constructor(
    private imageService: ImageService,
    private route: ActivatedRoute,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private markdownService: MarkdownService,
    private languageService: LanguageService,
    private renderingService: RenderingService
  ) {
  }


  baseUrl = environment.baseUrl;

  get backLabel(): string {
    return this.languageCode === 'pl' ? 'Wróć do kolekcji' : 'Back to collection';
  }

  get zoomHint(): string {
    return this.languageCode === 'pl' ? 'Kliknij, aby powiększyć' : 'Click to open full resolution';
  }

  get moreFramesLabel(): string {
    return this.languageCode === 'pl' ? 'Więcej kadrów' : 'More frames';
  }

  get descriptionFallback(): string {
    return this.languageCode === 'pl'
      ? 'Brak dodatkowego opisu dla tego kadru.'
      : 'No additional observing notes for this frame.';
  }

  get objectLabel(): string {
    return this.languageCode === 'pl' ? 'Obiekt' : 'Object';
  }

  get catalogLabel(): string {
    return this.languageCode === 'pl' ? 'Katalog' : 'Catalog';
  }

  get capturedLabel(): string {
    return this.languageCode === 'pl' ? 'Data' : 'Captured';
  }

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

  getImageUrl(image: Image | undefined, format = 'large'): string {
    if (!image) {
      return '';
    }

    const url = image.formats?.[format]?.url || image.url;
    return url ? `${environment.baseUrl}${url}` : '';
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const imageId = params.get('imageId');
      if (imageId) {
        this.posts$ = this.languageService.currentLanguage$.pipe(switchMap(() => {
          this.languageCode = this.languageService.currentLanguage$.value;
          return this.imageService.getImagesForSlug(imageId);
        })).pipe(
          tap(posts => {
            const category = posts.data[0]?.category;
            this.renderingService.changeBodyBackgroundImage(category?.background);
          })
        );
      }
    })
  }

  openImage(images: Image[], index = 0) {
    this.photoSwipe?.openGallery(images, index);

  }
}
