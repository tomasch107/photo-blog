import { Component } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import {CategoryService} from "../../services/category.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  protected readonly faBars = faBars;

  mobileView = false;

  categories$ = this.categoryService.getAllCategories();
  constructor(private categoryService: CategoryService) {
  }
}
