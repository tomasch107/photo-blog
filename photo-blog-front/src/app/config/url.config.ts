
export const urlConfig: UrlConfig =  {
  endpoints: {
    posts: '/posts?filters[category][code][$contains]={categoryCode}&populate[images][*]',
    post: '/posts?filters[slug][$contains]={slug}&populate[images][*]',
    posts2: '/posts',
    categories: '/categories?filters[category]&filters[id][$null]&[populate][2]=categories'
  }
}

export interface Endpoint {
  [key: string]: string
}

export interface UrlConfig {
  endpoints: Endpoint
}
