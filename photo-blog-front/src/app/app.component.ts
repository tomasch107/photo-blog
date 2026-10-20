import {DOCUMENT} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, DestroyRef, HostListener, effect, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Meta, Title} from '@angular/platform-browser';
import {RouterLink, RouterOutlet} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {HeaderComponent} from './components/header/header.component';
import {LanguageService} from './services/language.service';
import {RenderingService} from './services/rendering.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    RouterLink,
    RouterOutlet,
    TranslatePipe
  ]
})
export class AppComponent {
  readonly title = 'photo-blog-front';
  readonly currentYear = new Date().getFullYear();

  blogPost$: Observable<any> | undefined;

  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly renderingService = inject(RenderingService);
  private readonly languageService = inject(LanguageService);
  private readonly translate = inject(TranslateService);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.translate.addLangs(LanguageService.supportedLanguages);
    this.translate.setFallbackLang('en');

    effect(() => {
      const language = this.languageService.currentLanguage();

      this.document.documentElement.lang = language;
      this.translate.use(language);
      this.updateMeta();
    });
  }

  ngOnInit() {
    this.blogPost$ = this.http.get('https://photoblogapi.bieda.it/api/posts');
  }

  private updateMeta() {
    this.translate.get(['meta.title', 'meta.description'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((translations) => {
        this.titleService.setTitle(translations['meta.title']);
        this.metaService.updateTag({name: 'description', content: translations['meta.description']});
      });
  }

  /* Anchor jumps are handled here because the app uses <base href="/">, which
     makes a plain href="#fragment" navigate to the root route. */
  skipTo(id: string, event: Event) {
    const target = this.document.getElementById(id);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({behavior: 'smooth', block: 'start'});

    if (target instanceof HTMLElement) {
      target.focus({preventScroll: true});
    }
  }

  @HostListener('document:click', ['$event'])
  documentClick(event: any): void {
    this.renderingService.documentClickedTarget.next(event.target);
  }
}
