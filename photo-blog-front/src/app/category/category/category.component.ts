import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {ApiPaginatedResponse, Category} from "../../model/category.model";
import {CategoryService} from "../../services/category.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {Observable} from "rxjs";
import {Image, Post} from "../../model/image.model";
import {DOCUMENT} from "@angular/common";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit{
  posts$: Observable<ApiPaginatedResponse<Post>> | undefined;
  constructor(private categoryService: CategoryService,
               private route: ActivatedRoute, private renderer2: Renderer2,  @Inject(DOCUMENT) private document: Document) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const categoryCode = params.get('categoryCode');
      if (categoryCode) {
        this.posts$ = this.categoryService.getImagesForCategory(categoryCode);
      }
    })

    this.renderer2.removeClass(document.body, 'home');
    this.renderer2.addClass(document.body, 'category');

  }
}
