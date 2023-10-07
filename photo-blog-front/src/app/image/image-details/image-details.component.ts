import {Component, Inject, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CategoryService} from "../../services/category.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {DOCUMENT} from "@angular/common";
import {environment} from "../../../environments/environment";
import {Observable, pipe, switchMap, tap} from "rxjs";
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

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const imageId = params.get('imageId');
      if (imageId) {
        this.posts$ = this.languageService.currentLanguage$.pipe(switchMap(() => this.imageService.getImagesForSlug(imageId))).pipe(
          tap(posts => {
            if (posts.data.some( post => ['nature', 'natura'].includes(post.category.code))) {
              this.renderingService.changeBodyBackground('nature')
            } else {
              this.renderingService.changeBodyBackground('image')
            }
          })
        );
      }
    })
  }

  openImage(images: Image[]) {
    this.photoSwipe?.openGallery(images);

  }
}
