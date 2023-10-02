import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {urlConfig} from "../config/url.config";

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  getUrl(alias: string, replacements: any) {

    const urlWithPlaceholders = environment.apiUrl + urlConfig.endpoints[alias];


    return urlWithPlaceholders.replace(
      /{(\w+)}/g,
      (placeholderWithDelimiters, placeholderWithoutDelimiters) =>
        replacements.hasOwnProperty(placeholderWithoutDelimiters) ?
          replacements[placeholderWithoutDelimiters] : placeholderWithDelimiters
    );
  }
  constructor() { }
}
