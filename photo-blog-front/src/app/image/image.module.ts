import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageDetailsComponent } from './image-details/image-details.component';
import {ImageRoutingModule} from "./image-routing.module";
import {ImageService} from "./service/image.service";



@NgModule({
  declarations: [
    ImageDetailsComponent
  ],
  imports: [
    CommonModule,
    ImageRoutingModule
  ],
  providers: [ImageService]
})
export class ImageModule { }
