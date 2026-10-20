import {ChangeDetectionStrategy, Component, ElementRef, inject, input, viewChild} from '@angular/core';

import type {DataSourceArray} from 'photoswipe';
import {environment} from '../../../environments/environment';
import {Image} from '../../model/image.model';
import {ImageService} from '../service/image.service';

@Component({
  selector: 'app-photoswipe',
  templateUrl: './photoswipe.component.html',
  styleUrls: ['./photoswipe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhotoswipeComponent {
  readonly photoSwipe = viewChild<ElementRef<HTMLElement>>('photoSwipe');
  readonly images = input<Image[]>([]);

  private readonly imageService = inject(ImageService);

  // ========================================================================
  openGallery(images?: Image[], index = 0) {
    // Build gallery images array
    const galleryImages = images || this.images();

    const galleryItems: DataSourceArray = galleryImages.map((image) => {
      return {
        src: environment.baseUrl + image.url,
        width: Number(image.width),
        height: Number(image.height)
      };
    });

    this.imageService.openGallery(this.photoSwipe()?.nativeElement, galleryItems, index);
  }
}
