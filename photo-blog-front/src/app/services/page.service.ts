import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UrlService} from "./url.service";
import {Observable} from "rxjs";
import {ApiPaginatedResponse, Category} from "../model/category.model";
import {Page, Post} from "../model/image.model";

@Injectable({
  providedIn: 'root'
})
export class PageService {
  constructor(private http: HttpClient, private urlService: UrlService) { }

  getPageForCode(code: string): Observable<ApiPaginatedResponse<Page>> {
    const url = this.urlService.getUrl('pages', {code});

    return this.http.get<ApiPaginatedResponse<Page>>(url);
  }

}
