import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category/category.component';
import {CategoryRoutingModule} from "./category-routing.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {TranslateModule} from "@ngx-translate/core";



@NgModule({
  declarations: [
    CategoryComponent
  ],
    imports: [
        CommonModule,
        CategoryRoutingModule,
        InfiniteScrollModule,
        TranslateModule,
    ]
})
export class CategoryModule { }
