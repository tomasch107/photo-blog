import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CategoryService} from "../../services/category.service";
import {ApiPaginatedResponse, Category} from "../../model/category.model";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit{

  constructor(private categoryService: CategoryService) {

  }

  ngOnInit() {
  }
}
