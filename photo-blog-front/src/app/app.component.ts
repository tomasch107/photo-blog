import {Component, HostListener, Inject, OnDestroy, OnInit} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import {Meta, Title} from "@angular/platform-browser";
import {Observable, Subscription} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {RenderingService} from "./services/rendering.service";
import {LanguageService} from "./services/language.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'photo-blog-front';
  currentYear = new Date().getFullYear();

  blogPost$: Observable<any> | undefined;

  private subscriptions = new Subscription();

  constructor(
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document,
    private renderingService: RenderingService,
    private languageService: LanguageService,
    private translate: TranslateService,
    private titleService: Title,
    private metaService: Meta
  ) {
    this.translate.addLangs(LanguageService.supportedLanguages);
    this.translate.setDefaultLang('en');

    this.subscriptions.add(
      this.languageService.currentLanguage$.subscribe((language) => {
        this.document.documentElement.lang = language;
        this.translate.use(language);
        this.updateMeta();
      })
    );
  }

  ngOnInit() {
    this.blogPost$ = this.http.get('https://photoblogapi.bieda.it/api/posts')
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private updateMeta() {
    this.subscriptions.add(
      this.translate.get(['meta.title', 'meta.description']).subscribe((translations) => {
        this.titleService.setTitle(translations['meta.title']);
        this.metaService.updateTag({name: 'description', content: translations['meta.description']});
      })
    );
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
    this.renderingService.documentClickedTarget.next(event.target)
  }
}
