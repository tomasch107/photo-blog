export interface Category {
  id: number;
  name: string;
  code: string;
  categories: Category[];
  category: ApiResponse<Category>

}


export interface CategoryAttributes {
  name: string;
  code: string;
  categories: Category[];
  category: ApiResponse<Category>;
}

export interface ApiPaginatedResponse<T> {
    data: T[]
    meta: Meta
}

export interface ApiResponse<T> {
  data: T
  meta: Meta
}

export interface Meta {
  pagination: Pagination
}

export interface Pagination {
  page: number,
  pageSize: number,
  pageCount: number,
  total: number
}
