import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {Subject} from "rxjs";
import {Image} from "../model/image.model";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RenderingService {
  documentClickedTarget: Subject<HTMLElement> = new Subject<HTMLElement>()

  constructor(@Inject(DOCUMENT) private document: Document) {
  }

  changeBodyBackgroundImage(image?: Image | null) {
    const baseUrl = environment.baseUrl;
    const body = this.document.body;

    if (image?.url) {
      // Renderer2 does not support CSS custom properties, so set the variable directly.
      body.style.setProperty('--page-background-image', `url("${baseUrl}${image.url}")`);
    } else {
      body.style.removeProperty('--page-background-image');
    }
  }
}
