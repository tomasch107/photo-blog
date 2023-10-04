import {RouterModule, Routes} from "@angular/router";
import {CategoryComponent} from "../category/category/category.component";
import {NgModule} from "@angular/core";
import {ImageDetailsComponent} from "./image-details/image-details.component";

const routes: Routes = [
  {
    path: ':imageId',
    component: ImageDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImageRoutingModule {
}
