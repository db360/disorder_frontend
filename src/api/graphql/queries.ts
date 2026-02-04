import { gql } from '@apollo/client';

// Query para obtener todas las páginas públicas
export const GET_ALL_PAGE_SLUGS = gql`
  query GetAllPageSlugs {
    pages(where: { status: PUBLISH }) {
      nodes {
        slug
        uri
        title
        id
      }
    }
  }
`;


// Obtener todas las páginas
export const GET_ALL_PAGES = gql`
  query GetAllPages {
    pages {
      nodes {
        id
        title
        slug
        excerpt
        content
        uri
        isFrontPage
        isPostsPage
      }
    }
  }
`;
// Obtener página por slug
export const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      id
      title
      content
      slug
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
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
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;


// Obtener opciones del sitio (ACF Options Page si usas)
export const GET_SITE_OPTIONS = gql`
  query GetSiteOptions {
    acfOptionsSiteSettings {
      siteSettings {
        logo {
          sourceUrl
          altText
        }
        phone
        email
        address
        socialLinks {
          facebook
          twitter
          instagram
          linkedin
        }
      }
    }
  }
`;