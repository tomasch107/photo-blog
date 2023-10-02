import {RouterModule, Routes} from "@angular/router";
import {MainPageComponent} from "../main-page/main-page/main-page.component";
import {NgModule} from "@angular/core";
import {CategoryComponent} from "./category/category.component";

const routes: Routes = [
  {
    path: ':categoryCode',
    component: CategoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule {
}
