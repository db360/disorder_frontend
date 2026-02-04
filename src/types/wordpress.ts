export interface WordPressPage {
  id: string;
  slug: string;
  title: string;
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
  }>;
}