import {Injectable, OnDestroy} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {UrlService} from "../../services/url.service";
import {filter, Observable, Subscription} from "rxjs";
import {ApiPaginatedResponse} from "../../model/category.model";
import {Post} from "../../model/image.model";
import PhotoSwipe from "photoswipe";
import {NavigationEnd, Router} from "@angular/router";

@Injectable()
export class ImageService implements OnDestroy {
  constructor(private http: HttpClient, private urlService: UrlService, public router: Router) {
    this.subscriptions.add(
      router.events.pipe(
        filter((e) => e instanceof NavigationEnd)
      ).subscribe(() => {
        this.photoswipe?.close();
      })
    )
  }

  photoswipe: PhotoSwipe | undefined;
  private subscriptions = new Subscription();

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getImagesForSlug(slug: string): Observable<ApiPaginatedResponse<Post>> {
    const url = this.urlService.getUrl('post', {slug});

    return this.http.get<ApiPaginatedResponse<Post>>(url);
  }

  openGallery(element: any, images: any, index: number) {
    if (this.photoswipe) {
      this.photoswipe.close();
    }
    // Initializes and opens PhotoSwipe
    this.photoswipe = new PhotoSwipe({
      gallery: element,
      children: 'a',
      pswpModule: () => import('photoswipe'),
      dataSource: images,
      index: index,
      wheelToZoom: true
    });
    this.photoswipe.init();
  }
}
