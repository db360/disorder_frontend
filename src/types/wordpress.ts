export interface WPMenuItem {
  id: string;
  slug: string;
  title: string;
  menuOrder?: number | null;
}
export interface WordPressPage {
  id: string;
  slug: string;
  title: string;
  content?: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
}

export interface MediaDetailsSize {
  name: string;
  sourceUrl: string;
  width: string | number;
  height: string | number;
}

export interface MediaItem {
  sourceUrl: string;
  mediaItemUrl?: string;
  altText: string | null;
  mediaDetails?: {
    width: number;
    height: number;
    sizes?: MediaDetailsSize[];
  };
}

export interface Galeria {
  id: string;
  slug: string;
  title: string;
  galeriaMostrarEnFrontend?: boolean | null;
  seo?: {
    title?: string | null;
    metaDesc?: string | null;
  } | null;
  galeriaImagenes?: MediaItem[];
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
  }>;
}