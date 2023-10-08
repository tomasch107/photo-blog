
export const urlConfig: UrlConfig =  {
  endpoints: {
    posts: '/posts?sort[1]=date:desc&filters[category][code][$contains]={categoryCode}&populate[images][*]&populate[thumbnail][*]&pagination[page]={page}&pagination[pageSize]={pageSize}',
    allPostsExcept: '/posts?sort[1]=date:desc&filters[category][code][$notContains]=nature&populate[images][*]&pagination[page]={page}&pagination[pageSize]={pageSize}',
    post: '/posts?sort[1]=date:desc&filters[slug][$contains]={slug}&populate[images][*]&populate[category][populate]=*',
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
