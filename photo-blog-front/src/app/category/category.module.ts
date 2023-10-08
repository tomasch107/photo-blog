import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category/category.component';
import {CategoryRoutingModule} from "./category-routing.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";



@NgModule({
  declarations: [
    CategoryComponent
  ],
    imports: [
        CommonModule,
        CategoryRoutingModule,
        InfiniteScrollModule,
    ]
})
export class CategoryModule { }
