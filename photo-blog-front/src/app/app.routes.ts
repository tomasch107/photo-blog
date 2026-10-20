import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./main-page/main-page/main-page.component').then((m) => m.MainPageComponent)
  },
  {
    path: 'categories/:categoryCode',
    loadComponent: () => import('./category/category/category.component').then((m) => m.CategoryComponent)
  },
  {
    path: 'images/:imageId',
    loadComponent: () => import('./image/image-details/image-details.component').then((m) => m.ImageDetailsComponent)
  }
];
