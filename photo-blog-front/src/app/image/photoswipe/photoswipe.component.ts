import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';

// Import PhotoSwipe
import PhotoSwipe, {DataSource} from 'photoswipe';
import {Image} from "../../model/image.model";
import {environment} from "../../../environments/environment";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
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

    // @ts-ignore
    const newimages: DataSource = images.map((image) => {
      return {
        src:   environment.baseUrl + image.url,
        width: image.width,
        height: image.height
      }
    })

    this.imageService.openGallery(this.photoSwipe?.nativeElement, newimages, index);
  }
}
