import { gql } from "@apollo/client";

const MEDIA_FIELDS = gql`
  fragment MediaFields on MediaItem {
    sourceUrl
    mediaItemUrl
    altText
    mediaDetails {
      width
      height
      sizes {
        name
        sourceUrl
        width
        height
      }
    }
  }
`;

const PAGE_LIST_FIELDS = gql`
  fragment PageListFields on Page {
    id
    title
    slug
    uri
    isFrontPage
    isPostsPage
  }
`;

const PAGE_FULL_FIELDS = gql`
  fragment PageFullFields on Page {
    id
    title
    content
    slug
    seo {
      title
      metaDesc
      opengraphTitle
      opengraphDescription
      opengraphImage {
        sourceUrl
      }
      canonical
    }
    featuredImage {
      node {
        ...MediaFields
      }
    }
  }
  ${MEDIA_FIELDS}
`;

const GALERIA_FIELDS = gql`
  fragment GaleriaFields on Galeria {
    id
    title
    slug
    galeriaMostrarEnFrontend
    seo {
      title
      metaDesc
    }
    galeriaImagenes {
      ...MediaFields
    }
  }
  ${MEDIA_FIELDS}
`;

// Query para obtener todas las páginas públicas
export const GET_ALL_PAGE_SLUGS = gql`
  query GetAllPageSlugs {
    pages(where: { status: PUBLISH }) {
      nodes {
        slug
        uri
        title
        id
        menuOrder
      }
    }
  }
`;


// Obtener todas las páginas
export const GET_ALL_PAGES = gql`
  query GetAllPages {
    pages {
      nodes {
        ...PageListFields
      }
    }
  }
  ${PAGE_LIST_FIELDS}
`;
// Obtener página por slug
export const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      ...PageFullFields
    }
  }
  ${PAGE_FULL_FIELDS}
`;

// Obtener posts para blog (si tienes)
export const GET_POSTS = gql`
  query GetPosts($first: Int = 10) {
    posts(first: $first) {
      nodes {
        id
        title
        excerpt
        slug
        date
        featuredImage {
          node {
            ...MediaFields
          }
        }
      }
    }
  }
  ${MEDIA_FIELDS}
`;


// Obtener opciones del sitio (ACF Options Page si usas)
// Obtener todas las galerías
export const GET_ALL_GALERIAS = gql`
  query GetAllGalerias {
    galerias {
      nodes {
        ...GaleriaFields
      }
    }
  }
  ${GALERIA_FIELDS}
`;

// Obtener galería por slug
export const GET_GALERIA_BY_SLUG = gql`
  query GetGaleriaBySlug($slug: ID!) {
    galeria(id: $slug, idType: SLUG) {
      ...GaleriaFields
    }
  }
  ${GALERIA_FIELDS}
`;

export const GET_MEDIA_ITEMS_BY_IDS = gql`
  query GetMediaItemsByIds($ids: [ID]) {
    mediaItems(where: { in: $ids }) {
      nodes {
        databaseId
        sourceUrl
        mediaDetails {
          width
          sizes {
            sourceUrl
            width
          }
        }
      }
    }
  }
`;