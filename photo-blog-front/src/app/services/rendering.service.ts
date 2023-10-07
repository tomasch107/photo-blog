import {Inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {DOCUMENT} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class RenderingService {
  private renderer2: Renderer2;

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
}
