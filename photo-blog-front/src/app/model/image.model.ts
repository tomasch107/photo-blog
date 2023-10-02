
export interface BaseImage {
  id: string;
  url:string;
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
}
