import {Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CategoryService} from "../../services/category.service";
import {Category} from "../../model/category.model";
import {Router} from "@angular/router";
import {LanguageService} from "../../services/language.service";
import {Subscription, switchMap, catchError, of, tap} from "rxjs";
import {RenderingService} from "../../services/rendering.service";
import {DOCUMENT} from "@angular/common";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  subscriptions = new Subscription();
  mobileNavOpen = false;
  navFallback = false;

  @ViewChild('navTogle', {static: false}) navToggle: ElementRef | undefined;
  @ViewChild('nav', {static: false}) nav: ElementRef | undefined;
  categories$ = this.languageService.currentLanguage$.pipe(
    tap(() => this.navFallback = false),
    switchMap(() => this.categoryService.getAllCategories().pipe(
      tap((categories) => this.navFallback = !categories.data.length),
      catchError(() => {
        this.navFallback = true;
        return of(null);
      })
    ))
  )

  constructor(private categoryService: CategoryService, private renderer2: Renderer2, private router: Router, private languageService: LanguageService, private renderingService: RenderingService,     @Inject(DOCUMENT) private document: Document,
  ) {
  }

  mobileToggle() {
    this.toggleMobileNavbar(!this.mobileNavOpen);
  }

  toggleMobileNavbar(open: boolean) {
    this.mobileNavOpen = open;
    this.setBackgroundInert(open);

    if (open) {
      this.renderer2.addClass(this.document.body, 'navbar-opened');
    } else {
      this.renderer2.removeClass(this.document.body, 'navbar-opened');
    }

    this.renderer2.setAttribute(this.nav?.nativeElement, "data-visible", String(open));

    if (open) {
      this.focusFirstNavItem();
    } else if (this.nav?.nativeElement.contains(this.document.activeElement)) {
      const toggle = this.navToggle?.nativeElement as HTMLElement | undefined;

      if (toggle && toggle.offsetWidth > 0) {
        toggle.focus();
      }
    }
  }

  closeMobileNav() {
    if (this.mobileNavOpen) {
      this.toggleMobileNavbar(false);
    }
  }

  @HostListener('document:keydown.escape')
  closeMobileNavOnEscape(): void {
    this.closeMobileNav();
  }

  @HostListener('window:resize')
  closeMobileNavOnDesktop(): void {
    const viewportWidth = this.document.defaultView?.innerWidth ?? 0;

    if (this.mobileNavOpen && viewportWidth > 896) {
      this.toggleMobileNavbar(false);
    }
  }

  private setBackgroundInert(inert: boolean): void {
    this.document.querySelectorAll('.app-content, .site-footer, .skip-to-content').forEach((element) => {
      if (inert) {
        element.setAttribute('inert', '');
      } else {
        element.removeAttribute('inert');
      }
    });
  }

  private focusFirstNavItem(): void {
    const firstItem: HTMLElement | null = this.nav?.nativeElement.querySelector('a, button') ?? null;

    if (firstItem) {
      setTimeout(() => firstItem.focus(), 0);
    }
  }

  ngOnInit() {
    this.subscriptions.add(
      this.renderingService.documentClickedTarget.subscribe((target) => {
        if (this.mobileNavOpen && !this.nav?.nativeElement.contains(target) && !this.navToggle?.nativeElement.contains(target)) {
          this.toggleMobileNavbar(false);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.setBackgroundInert(false);
    this.renderer2.removeClass(this.document.body, 'navbar-opened');
  }

  isRouterLinkActive(category?: Category): boolean {
    const url = this.router.url;

    if (!category) {
      return !url || url.length <= 1;
    }

    return url.includes(`/categories/${category.code}`)
      || (category.categories?.some((subCategory) => url.includes(`/categories/${subCategory.code}`)) ?? false);
  }

  isLanguageActive(languageIsoCode?: string): boolean {
    return this.languageService.currentLanguage$.value === languageIsoCode;
  }

  changeLanguage(en: string) {
    this.languageService.changeLanguage(en);
  }
}
