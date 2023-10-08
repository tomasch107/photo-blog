
export const urlConfig: UrlConfig =  {
  endpoints: {
    posts: '/posts?filters[category][code][$contains]={categoryCode}&populate[images][*]&populate[thumbnail][*]',
    allPostsExcept: '/posts?filters[category][code][$notContains]=nature&populate[images][*]',
    post: '/posts?filters[slug][$contains]={slug}&populate[images][*]&populate[category][populate]=*',
    categories: '/categories?filters[category]&sort[1]=order&filters[id][$null]&[populate][2]=categories',
    category: '/categories?filters[code][$eq]={code}&populate[background][*]',
    pages: '/pages?filters[code][$eq]={code}&populate[background][*]',
  }
}

export interface Endpoint {
  [key: string]: string
}

export interface UrlConfig {
  endpoints: Endpoint
}
