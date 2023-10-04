import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {UrlService} from "../../services/url.service";
import {Observable} from "rxjs";
import {ApiPaginatedResponse, Category} from "../../model/category.model";
import {Post} from "../../model/image.model";

@Injectable()
export class ImageService {
  constructor(private http: HttpClient, private urlService: UrlService) { }

  getImagesForSlug(slug: string): Observable<ApiPaginatedResponse<Post>> {
    const url = this.urlService.getUrl('post', {slug});

    return this.http.get<ApiPaginatedResponse<Post>>(url);
  }
}
