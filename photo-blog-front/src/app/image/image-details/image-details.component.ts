import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, ParamMap} from "@angular/router";
import {environment} from "../../../environments/environment";
import {catchError, Observable, of, switchMap} from "rxjs";
import {Image, Post} from "../../model/image.model";
import {ApiPaginatedResponse} from "../../model/category.model";
import {ImageService} from "../service/image.service";
import {PhotoswipeComponent} from "../photoswipe/photoswipe.component";
import {LanguageService} from "../../services/language.service";

@Component({
  selector: 'app-image-details',
  templateUrl: './image-details.component.html',
  styleUrls: ['./image-details.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ImageDetailsComponent implements OnInit {
  @ViewChild('photoSwipe') photoSwipe: PhotoswipeComponent | undefined;

  posts$: Observable<ApiPaginatedResponse<Post> | null> | undefined;
  loadFailed = false;
  private currentSlug = '';

  constructor(
    private imageService: ImageService,
    private route: ActivatedRoute,
    private languageService: LanguageService
  ) {
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

  getImageUrl(image: Image | undefined, format = 'large'): string {
    if (!image) {
      return '';
    }

    const url = image.formats?.[format]?.url || image.url;
    return url ? `${environment.baseUrl}${url}` : '';
  }

  getAspectRatio(image: Image): string {
    const width = Number(image?.width);
    const height = Number(image?.height);

    return width > 0 && height > 0 ? `${width} / ${height}` : '4 / 3';
  }

  formatIndex(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const imageId = params.get('imageId');
      if (imageId) {
        this.currentSlug = imageId;
        this.loadPost();
      }
    })
  }

  retry() {
    if (this.currentSlug) {
      this.loadPost();
    }
  }

  private loadPost() {
    this.posts$ = this.languageService.currentLanguage$.pipe(
      switchMap(() => {
        this.loadFailed = false;

        return this.imageService.getImagesForSlug(this.currentSlug).pipe(
          catchError(() => {
            this.loadFailed = true;
            return of(null);
          })
        );
      })
    );
  }

  openImage(images: Image[], index = 0) {
    this.photoSwipe?.openGallery(images, index);

  }
}
