import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from './main-page/main-page.component';
import {MainPageRoutingModule} from "./main-page-routing.module";
import {TranslatePipe} from "@ngx-translate/core";

@NgModule({
  declarations: [
    MainPageComponent
  ],
  imports: [
    CommonModule,
    MainPageRoutingModule,
    TranslatePipe
  ]
})
export class MainPageModule { }
