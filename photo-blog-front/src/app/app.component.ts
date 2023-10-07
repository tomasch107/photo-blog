import {Component, HostListener, OnInit} from '@angular/core';
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

  blogPost$: Observable<any> | undefined;

  constructor(private http: HttpClient, private renderingService: RenderingService) {
    var language = navigator.language;
    // localStorage.setItem('lang', language.slice(0,2));
    // console.log(navigator)
  }

  ngOnInit() {
    this.blogPost$ = this.http.get('https://photoblogapi.bieda.it/api/posts')
  }

  @HostListener('document:click', ['$event'])
  documentClick(event: any): void {
    this.renderingService.documentClickedTarget.next(event.target)
  }
}
