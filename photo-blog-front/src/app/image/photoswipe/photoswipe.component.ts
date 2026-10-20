import {Component, ElementRef, Input, ViewChild} from '@angular/core';

import type {DataSourceArray} from 'photoswipe';
import {Image} from "../../model/image.model";
import {environment} from "../../../environments/environment";
import {ImageService} from "../service/image.service";

@Component({
  selector: 'app-photoswipe',
  templateUrl: './photoswipe.component.html',
  styleUrls: ['./photoswipe.component.scss']
})
export class PhotoswipeComponent {
  @ViewChild('photoSwipe') photoSwipe: ElementRef | undefined;

  @Input() images: Image[] = [];

  // ========================================================================
  constructor(private imageService: ImageService) { }


  // ========================================================================
  openGallery(images?: Image[], index = 0)
  {
    // Build gallery images array
    images = images || this.images;

    const galleryItems: DataSourceArray = images.map((image) => {
      return {
        src: environment.baseUrl + image.url,
        width: Number(image.width),
        height: Number(image.height)
      }
    });

    this.imageService.openGallery(this.photoSwipe?.nativeElement, galleryItems, index);
  }
}
