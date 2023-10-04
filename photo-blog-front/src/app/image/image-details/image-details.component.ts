import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {CategoryService} from "../../services/category.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {DOCUMENT} from "@angular/common";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {Post} from "../../model/image.model";
import {ApiPaginatedResponse} from "../../model/category.model";
import {ImageService} from "../service/image.service";

@Component({
  selector: 'app-image-details',
  templateUrl: './image-details.component.html',
  styleUrls: ['./image-details.component.scss']
})
export class ImageDetailsComponent implements OnInit {

  posts$: Observable<ApiPaginatedResponse<Post>> | undefined;
  constructor(
    private imageService: ImageService,
    private route: ActivatedRoute,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
  }


  baseUrl = environment.baseUrl;

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const categoryCode = params.get('imageId');
      if (categoryCode) {
        this.posts$ = this.imageService.getImagesForSlug(categoryCode);
      }
    })

    this.renderer2.removeClass(document.body, 'category');
    this.renderer2.removeClass(document.body, 'home');
    this.renderer2.addClass(document.body, 'image');

  }
}
