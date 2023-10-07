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

  private readonly backgroundClasses = ['home', 'image', 'nature', 'category']

  changeBodyBackground(newClass: string) {
    this.renderer2.removeClass(document.body, 'home');
    this.renderer2.removeClass(document.body, 'image');
    this.renderer2.removeClass(document.body, 'nature');

    this.backgroundClasses.forEach(bodyClass => {
      this.renderer2.removeClass(document.body, bodyClass);
    })

    this.renderer2.addClass(document.body, newClass);
  }

  changeBodyBackgroundImage(image: Image) {
    const baseUrl = environment.baseUrl;

    if (image) {
      this.renderer2.setStyle(document.body, 'background-image', `url(${baseUrl}${image.url})`);
    }
  }
}
