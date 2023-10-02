import {Component, OnInit} from '@angular/core';
import {ApiPaginatedResponse, Category} from "../../model/category.model";
import {CategoryService} from "../../services/category.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {Observable} from "rxjs";
import {Image, Post} from "../../model/image.model";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit{
  posts$: Observable<ApiPaginatedResponse<Post>> | undefined;
  constructor(private categoryService: CategoryService,
               private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const categoryCode = params.get('categoryCode');
      if (categoryCode) {
        this.posts$ = this.categoryService.getImagesForCategory(categoryCode);
      }
    })
  }
}
