import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CategoryService} from "../../services/category.service";
import {ApiPaginatedResponse, Category} from "../../model/category.model";
import {DOCUMENT} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit{

  constructor(private categoryService: CategoryService, private renderer2: Renderer2,  @Inject(DOCUMENT) private document: Document, private router: Router) {

  }

  ngOnInit() {
    this.renderer2.addClass(document.body, 'home');
    this.renderer2.removeClass(document.body, 'category');
    this.renderer2.removeClass(document.body, 'image');
  }

}
