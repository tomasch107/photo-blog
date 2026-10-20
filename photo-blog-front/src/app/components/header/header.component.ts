import {DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Renderer2,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {MatMenuModule} from '@angular/material/menu';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {catchError, filter, map, of, switchMap} from 'rxjs';
import {Category} from '../../model/category.model';
import {CategoryService} from '../../services/category.service';
import {LanguageService} from '../../services/language.service';
import {RenderingService} from '../../services/rendering.service';

interface CategoriesState {
  categories: Category[] | null;
  failed: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatMenuModule,
    RouterLink,
    TranslatePipe
  ]
})
export class HeaderComponent {
  readonly mobileNavOpen = signal(false);

  private readonly categoryService = inject(CategoryService);
  private readonly renderer2 = inject(Renderer2);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);
  private readonly renderingService = inject(RenderingService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private readonly navToggle = viewChild<ElementRef<HTMLElement>>('navTogle');
  private readonly nav = viewChild<ElementRef<HTMLElement>>('nav');

  private readonly categoriesState = toSignal(
    toObservable(this.languageService.currentLanguage).pipe(
      switchMap(() => this.categoryService.getAllCategories().pipe(
        map((response): CategoriesState => ({categories: response.data, failed: false})),
        catchError(() => of<CategoriesState>({categories: null, failed: true}))
      ))
    ),
    {initialValue: {categories: null, failed: false}}
  );

  readonly categories = computed(() => this.categoriesState().categories);

  readonly navFallback = computed(() => {
    const state = this.categoriesState();

    return state.failed || (!!state.categories && state.categories.length === 0);
  });

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    {initialValue: this.router.url}
  );

  constructor() {
    this.renderingService.documentClickedTarget
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((target) => {
        if (this.mobileNavOpen()
          && !this.nav()?.nativeElement.contains(target)
          && !this.navToggle()?.nativeElement.contains(target)) {
          this.toggleMobileNavbar(false);
        }
      });

    this.destroyRef.onDestroy(() => {
      this.setBackgroundInert(false);
      this.renderer2.removeClass(this.document.body, 'navbar-opened');
    });
  }

  mobileToggle() {
    this.toggleMobileNavbar(!this.mobileNavOpen());
  }

  toggleMobileNavbar(open: boolean) {
    this.mobileNavOpen.set(open);
    this.setBackgroundInert(open);

    if (open) {
      this.renderer2.addClass(this.document.body, 'navbar-opened');
    } else {
      this.renderer2.removeClass(this.document.body, 'navbar-opened');
    }

    this.renderer2.setAttribute(this.nav()?.nativeElement, 'data-visible', String(open));

    if (open) {
      this.focusFirstNavItem();
    } else if (this.nav()?.nativeElement.contains(this.document.activeElement)) {
      const toggle = this.navToggle()?.nativeElement;

      if (toggle && toggle.offsetWidth > 0) {
        toggle.focus();
      }
    }
  }

  closeMobileNav() {
    if (this.mobileNavOpen()) {
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

    if (this.mobileNavOpen() && viewportWidth > 896) {
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
    const firstItem: HTMLElement | null = this.nav()?.nativeElement.querySelector('a, button') ?? null;

    if (firstItem) {
      setTimeout(() => firstItem.focus(), 0);
    }
  }

  isRouterLinkActive(category?: Category): boolean {
    const url = this.currentUrl();

    if (!category) {
      return !url || url.length <= 1;
    }

    return url.includes(`/categories/${category.code}`)
      || (category.categories?.some((subCategory) => url.includes(`/categories/${subCategory.code}`)) ?? false);
  }

  isLanguageActive(languageIsoCode?: string): boolean {
    return this.languageService.currentLanguage() === languageIsoCode;
  }

  changeLanguage(languageIsoCode: string) {
    this.languageService.changeLanguage(languageIsoCode);
  }
}
