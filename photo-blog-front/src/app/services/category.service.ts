import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UrlService} from "./url.service";
import {ApiPaginatedResponse, Category} from "../model/category.model";
import {Observable} from "rxjs";
import {Post} from "../model/image.model";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient, private urlService: UrlService) { }

  getAllCategories(): Observable<ApiPaginatedResponse<Category>> {
    const url = this.urlService.getUrl('categories', {});

    return this.http.get<ApiPaginatedResponse<Category>>(url);
  }

  getImagesForCategory(categoryCode: string, page = 1, pageSize = 25): Observable<ApiPaginatedResponse<Post>> {
    const url = this.urlService.getUrl('posts', {categoryCode, page, pageSize});

    return this.http.get<ApiPaginatedResponse<Post>>(url);
  }

  getCategoryForCode(code: string): Observable<ApiPaginatedResponse<Category>> {
  const url = this.urlService.getUrl('category', {code});

  return this.http.get<ApiPaginatedResponse<Category>>(url);
}

  getAllImages(page = 1, pageSize = 25): Observable<ApiPaginatedResponse<Post>> {
    const url = this.urlService.getUrl('allPostsExcept', {page, pageSize});

    return this.http.get<ApiPaginatedResponse<Post>>(url);
  }
}
