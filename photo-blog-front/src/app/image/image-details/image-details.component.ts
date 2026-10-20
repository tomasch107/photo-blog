import {DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, inject, signal, viewChild} from '@angular/core';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {MarkdownComponent} from 'ngx-markdown';
import {catchError, map, of, startWith, switchMap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ApiPaginatedResponse} from '../../model/category.model';
import {Image, Post} from '../../model/image.model';
import {LanguageService} from '../../services/language.service';
import {ImageService} from '../service/image.service';
import {PhotoswipeComponent} from '../photoswipe/photoswipe.component';

interface DetailState {
  posts: ApiPaginatedResponse<Post> | null;
  loading: boolean;
  failed: boolean;
}

@Component({
  selector: 'app-image-details',
  templateUrl: './image-details.component.html',
  styleUrls: ['./image-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MarkdownComponent,
    PhotoswipeComponent,
    RouterLink,
    TranslatePipe
  ],
  providers: [ImageService]
})
export class ImageDetailsComponent {
  private readonly imageService = inject(ImageService);
  private readonly route = inject(ActivatedRoute);
  private readonly languageService = inject(LanguageService);

  readonly photoSwipe = viewChild(PhotoswipeComponent);

  private readonly retryCount = signal(0);

  private readonly imageId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('imageId'))),
    {initialValue: null}
  );

  private readonly request = computed(() => ({
    imageId: this.imageId(),
    language: this.languageService.currentLanguage(),
    retry: this.retryCount()
  }));

  readonly state = toSignal(
    toObservable(this.request).pipe(
      switchMap(({imageId}) => {
        if (!imageId) {
          return of<DetailState>({posts: null, loading: false, failed: true});
        }

        return this.imageService.getImagesForSlug(imageId).pipe(
          map((posts): DetailState => ({posts, loading: false, failed: false})),
          catchError(() => of<DetailState>({posts: null, loading: false, failed: true})),
          startWith<DetailState>({posts: null, loading: true, failed: false})
        );
      })
    ),
    {initialValue: {posts: null, loading: true, failed: false}}
  );

  readonly post = computed(() => this.state().posts?.data[0] ?? null);

  readonly galleryImages = computed(() => this.post()?.images.slice(1) ?? []);

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

  retry() {
    this.retryCount.update((value) => value + 1);
  }

  openImage(images: Image[], index = 0) {
    this.photoSwipe()?.openGallery(images, index);
  }
}
