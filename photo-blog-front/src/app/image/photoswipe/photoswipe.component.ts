import {Component, ElementRef, Input, ViewChild} from '@angular/core';

// Import PhotoSwipe
import PhotoSwipe, {DataSource} from 'photoswipe';
import {Image} from "../../model/image.model";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-photoswipe',
  templateUrl: './photoswipe.component.html',
  styleUrls: ['./photoswipe.component.scss']
})
export class PhotoswipeComponent {
  @ViewChild('photoSwipe') photoSwipe: ElementRef | undefined;

  @Input() images: Image[] = [];

  // ========================================================================
  constructor() { }

  // ========================================================================
  openGallery(images?: Image[], index = 0)
  {
    // Build gallery images array
    images = images || this.images;

    // @ts-ignore
    const newimages: DataSource = images.map((image) => {
      return {
        src:   environment.baseUrl + image.url,
        width: image.width,
        height: image.height
      }
    })

    // Initializes and opens PhotoSwipe
    const gallery = new PhotoSwipe({
      gallery: this.photoSwipe?.nativeElement,
      children: 'a',
      pswpModule: () => import('photoswipe'),
      dataSource: newimages,
      index: index,
      wheelToZoom: true
    });
    gallery.init();
  }
}
