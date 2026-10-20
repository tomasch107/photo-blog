import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoswipeComponent } from './photoswipe.component';
import { ImageService } from '../service/image.service';
import { environment } from '../../../environments/environment';

describe('PhotoswipeComponent', () => {
  let component: PhotoswipeComponent;
  let fixture: ComponentFixture<PhotoswipeComponent>;
  let imageService: jasmine.SpyObj<ImageService>;

  beforeEach(async () => {
    imageService = jasmine.createSpyObj<ImageService>('ImageService', ['openGallery']);

    await TestBed.configureTestingModule({
      declarations: [ PhotoswipeComponent ],
      providers: [
        { provide: ImageService, useValue: imageService }
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoswipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the gallery with the supplied images', () => {
    const images = [{ url: '/uploads/a.jpg', width: 10, height: 20 } as any];

    component.openGallery(images, 0);

    const [element, galleryItems, index] = imageService.openGallery.calls.mostRecent().args;
    expect(element).toBe(component.photoSwipe?.nativeElement);
    expect(galleryItems).toEqual([
      { src: `${environment.baseUrl}/uploads/a.jpg`, width: 10, height: 20 }
    ]);
    expect(index).toBe(0);
  });
});
