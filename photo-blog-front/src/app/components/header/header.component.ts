import {Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import {CategoryService} from "../../services/category.service";
import {Category} from "../../model/category.model";
import {Router} from "@angular/router";
import {LanguageService} from "../../services/language.service";
import {switchMap} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  mobileView = false;

  @ViewChild('navTogle', {static: false}) navToggle: ElementRef | undefined;
  @ViewChild('nav', {static: false}) nav: ElementRef | undefined;
  categories$ = this.languageService.currentLanguage$.pipe(
    switchMap(() => this.categoryService.getAllCategories())
  )
  constructor(private categoryService: CategoryService, private renderer2: Renderer2, private router: Router, private languageService: LanguageService) {
  }

  mobileToggle() {
    const visiblity = this.nav?.nativeElement.getAttribute("data-visible");
    if (visiblity === "false") {
      this.renderer2.setAttribute(this.nav?.nativeElement, "data-visible", String(true))
      this.renderer2.setAttribute(this.navToggle?.nativeElement, "aria-expanded", String(true))
    } else {
      this.renderer2.setAttribute(this.nav?.nativeElement, "data-visible", String(false))
      this.renderer2.setAttribute(this.navToggle?.nativeElement, "aria-expanded", String(false))
    }
  }


  isRouterLinkActive(category?: Category): boolean {
    const url = this.router.url;
    if (category) {
      return url.includes(category.code);
    } else {
      return !url || url.length <=1;
    }
  }

  openSubCategories(parentCategory: HTMLLIElement) {
    this.renderer2.addClass(parentCategory, "open")
  }

  changeLanguage(en: string) {
    this.languageService.changeLanguage(en);
  }
}
