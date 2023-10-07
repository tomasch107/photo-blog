
export const urlConfig: UrlConfig =  {
  endpoints: {
    posts: '/posts?filters[category][code][$contains]={categoryCode}&populate[images][*]',
    allPostsExcept: '/posts?filters[category][code][$notContains]=nature&populate[images][*]',
    post: '/posts?filters[slug][$contains]={slug}&populate[images][*]&populate[category][*]',
    categories: '/categories?filters[category]&sort[1]=order&filters[id][$null]&[populate][2]=categories'
  }
}

export interface Endpoint {
  [key: string]: string
}

export interface UrlConfig {
  endpoints: Endpoint
}
