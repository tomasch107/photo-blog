import {Category} from "./category.model";

export interface BaseImage {
  id: string;
  url:string;
  width:string;
  height:string;
}

export interface Image extends BaseImage {
  formats: ImageFormat
}

export interface ImageFormat {
  [key: string]: BaseImage
}



export interface Post {
  images: Image[];
  date: string;
  id: string;
  locale: string;
  title:string;
  description:string;
  slug:string;
  category: Category
}
