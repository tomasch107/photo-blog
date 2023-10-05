import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageDetailsComponent } from './image-details/image-details.component';
import {ImageRoutingModule} from "./image-routing.module";
import {ImageService} from "./service/image.service";
import {MarkdownModule, MarkdownService} from "ngx-markdown";
import { PhotoswipeComponent } from './photoswipe/photoswipe.component';



@NgModule({
  declarations: [
    ImageDetailsComponent,
    PhotoswipeComponent
  ],
  imports: [
    CommonModule,
    MarkdownModule.forRoot(),
    ImageRoutingModule,
    MarkdownModule,
  ],
  providers: [ImageService]
})
export class ImageModule { }
