import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category/category.component';
import {CategoryRoutingModule} from "./category-routing.module";
import {MatCardModule} from "@angular/material/card";



@NgModule({
  declarations: [
    CategoryComponent
  ],
  imports: [
    CommonModule,
    CategoryRoutingModule,
    MatCardModule
  ]
})
export class CategoryModule { }
