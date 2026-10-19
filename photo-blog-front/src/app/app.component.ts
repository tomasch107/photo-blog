import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {RenderingService} from "./services/rendering.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'photo-blog-front';
  currentYear = new Date().getFullYear();

  blogPost$: Observable<any> | undefined;

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document, private renderingService: RenderingService,) {
    var language = navigator.language;
    // localStorage.setItem('lang', language.slice(0,2));
    // console.log(navigator)
  }

  ngOnInit() {
    this.blogPost$ = this.http.get('https://photoblogapi.bieda.it/api/posts')
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
