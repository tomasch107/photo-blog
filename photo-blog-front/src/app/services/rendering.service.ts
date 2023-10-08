import {Inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {Subject} from "rxjs";
import {Image} from "../model/image.model";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RenderingService {
  private renderer2: Renderer2;
  documentClickedTarget: Subject<HTMLElement> = new Subject<HTMLElement>()

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2
  ) {
    this.renderer2 = rendererFactory.createRenderer(document, null);

  }
  changeBodyBackgroundImage(image: Image) {
    const baseUrl = environment.baseUrl;

    if (image) {
      this.renderer2.setStyle(document.body, 'background-image', `url(${baseUrl}${image.url})`);
    }
  }
}
