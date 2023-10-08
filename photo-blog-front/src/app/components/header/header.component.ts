import {Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {faBars} from '@fortawesome/free-solid-svg-icons';
import {CategoryService} from "../../services/category.service";
import {Category} from "../../model/category.model";
import {Router} from "@angular/router";
import {LanguageService} from "../../services/language.service";
import {Subscription, switchMap} from "rxjs";
import {RenderingService} from "../../services/rendering.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  subscriptions = new Subscription();
  mobileView = false;

  @ViewChild('navTogle', {static: false}) navToggle: ElementRef | undefined;
  @ViewChild('nav', {static: false}) nav: ElementRef | undefined;
  categories$ = this.languageService.currentLanguage$.pipe(
    switchMap(() => this.categoryService.getAllCategories())
  )

  constructor(private categoryService: CategoryService, private renderer2: Renderer2, private router: Router, private languageService: LanguageService, private renderingService: RenderingService) {
  }

  mobileToggle() {
    const visiblity = this.nav?.nativeElement.getAttribute("data-visible");
    if (visiblity === "false") {
      this.toggleMobileNavbar(true);
    } else {
      this.toggleMobileNavbar(false);
    }
  }

  toggleMobileNavbar(open: boolean) {
    this.renderer2.setAttribute(this.nav?.nativeElement, "data-visible", String(open))
    this.renderer2.setAttribute(this.navToggle?.nativeElement, "aria-expanded", String(open))
  }

  ngOnInit() {
    this.subscriptions.add(
      this.renderingService.documentClickedTarget.subscribe((target) => {
        const visiblity = this.nav?.nativeElement.getAttribute("data-visible");
        if (visiblity !== 'false' && !this.nav?.nativeElement.contains(target) && !this.navToggle?.nativeElement.contains(target)) {
          this.toggleMobileNavbar(false);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  isRouterLinkActive(category?: Category): boolean {
    const url = this.router.url;
    if (category) {
      return url.includes(category.code);
    } else {
      return !url || url.length <= 1;
    }
  }

  isLanguageActive(languageIsoCode?: string): boolean {
    return this.languageService.currentLanguage$.value === languageIsoCode;
  }


  openSubCategories(parentCategory: HTMLLIElement) {
    this.renderer2.addClass(parentCategory, "open")
  }

  changeLanguage(en: string) {
    this.languageService.changeLanguage(en);
  }
}
