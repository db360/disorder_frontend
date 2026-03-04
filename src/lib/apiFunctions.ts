import client from "../api/graphql/client";
import {
  GetAllPageSlugsDocument,
  GetAllPagesDocument,
  type GetAllPageSlugsQuery,
  type GetAllPagesQuery,
  type GetPageBySlugQuery,
  type GetPageBySlugQueryVariables,
  type GetAllGaleriasQuery,
  type GetGaleriaBySlugQuery,
  type GetGaleriaBySlugQueryVariables,
} from "../api/graphql/generated";
import {
  GET_ALL_GALERIAS,
  GET_GALERIA_BY_SLUG,
  GET_MEDIA_ITEMS_BY_IDS,
  GET_PAGE_BY_SLUG,
  GET_POSTS,
  GET_POST_BY_SLUG,
} from "../api/graphql/queries";

import type { WordPressPage, WPMenuItem, Galeria } from "../types/wordpress";

type MediaItemForSrcSet = {
  databaseId: number;
  sourceUrl?: string | null;
  mediaDetails?: {
    width?: number | null;
    sizes?: Array<{
      sourceUrl?: string | null;
      width?: string | null;
    } | null> | null;
  } | null;
};

type GetMediaItemsByIdsQuery = {
  mediaItems?: {
    nodes?: Array<MediaItemForSrcSet | null> | null;
  } | null;
};

type GetMediaItemsByIdsQueryVariables = {
  ids: string[];
};

export type BlogPostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string | null;
  featuredImage?: {
    sourceUrl: string;
    altText: string | null;
  };
};

export type BlogPostDetail = {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string | null;
  seo?: {
    title?: string | null;
    metaDesc?: string | null;
    opengraphTitle?: string | null;
    opengraphDescription?: string | null;
    opengraphImage?: {
      sourceUrl?: string | null;
    } | null;
    canonical?: string | null;
  } | null;
  featuredImage?: {
    sourceUrl: string;
    altText: string | null;
  };
};

type GetPostBySlugQuery = {
  post?: {
    id: string;
    slug?: string | null;
    title?: string | null;
    content?: string | null;
    excerpt?: string | null;
    date?: string | null;
    seo?: BlogPostDetail["seo"];
    featuredImage?: {
      node?: {
        sourceUrl?: string | null;
        altText?: string | null;
      } | null;
    } | null;
  } | null;
};

type GetPostBySlugQueryVariables = {
  slug: string;
};

type GetPostsListQuery = {
  posts?: {
    nodes?: Array<{
      id: string;
      slug?: string | null;
      title?: string | null;
      excerpt?: string | null;
      date?: string | null;
      featuredImage?: {
        node?: {
          sourceUrl?: string | null;
          altText?: string | null;
        } | null;
      } | null;
    } | null> | null;
  } | null;
};

type GetPostsListQueryVariables = {
  first?: number;
};

const DEFAULT_CONTENT_IMAGE_SIZES = "(min-width: 1024px) 1024px, 100vw";

const extractWordPressImageIds = (html: string): number[] => {
  const matches = html.match(/wp-image-(\d+)/g) ?? [];
  return [...new Set(matches.map((match) => Number(match.replace("wp-image-", ""))).filter(Number.isFinite))];
};

const buildSrcSetFromMediaItem = (mediaItem: MediaItemForSrcSet): string => {
  const sizes = mediaItem.mediaDetails?.sizes ?? [];
  const normalizedSizes = sizes
    .filter((size): size is NonNullable<typeof size> => Boolean(size))
    .map((size) => {
      if (!size.sourceUrl || !size.width) return null;
      return `${size.sourceUrl} ${size.width}w`;
    })
    .filter((value): value is string => Boolean(value));

  const originalWidth = mediaItem.mediaDetails?.width;
  if (mediaItem.sourceUrl && originalWidth) {
    normalizedSizes.push(`${mediaItem.sourceUrl} ${originalWidth}w`);
  }

  return [...new Set(normalizedSizes)].join(", ");
};

const injectSrcSetInHtmlContent = (
  html: string,
  mediaByDatabaseId: Map<number, MediaItemForSrcSet>
): string => {
  return html.replace(/<img\b[^>]*>/gi, (imgTag) => {
    if (/\ssrcset\s*=\s*/i.test(imgTag)) {
      return imgTag;
    }

    const imageIdMatch = imgTag.match(/wp-image-(\d+)/i);
    if (!imageIdMatch) {
      return imgTag;
    }

    const mediaItem = mediaByDatabaseId.get(Number(imageIdMatch[1]));
    if (!mediaItem) {
      return imgTag;
    }

    const srcSet = buildSrcSetFromMediaItem(mediaItem);
    if (!srcSet) {
      return imgTag;
    }

    const hasSizes = /\ssizes\s*=\s*/i.test(imgTag);
    const attributesToInject = hasSizes
      ? ` srcset="${srcSet}"`
      : ` srcset="${srcSet}" sizes="${DEFAULT_CONTENT_IMAGE_SIZES}"`;

    return imgTag.replace(/\/?>(\s*)$/, `${attributesToInject}>$1`);
  });
};

const getMediaItemsByIds = async (ids: number[]): Promise<Map<number, MediaItemForSrcSet>> => {
  if (ids.length === 0) {
    return new Map();
  }

  try {
    const { data } = await client.query<GetMediaItemsByIdsQuery, GetMediaItemsByIdsQueryVariables>(
      {
        query: GET_MEDIA_ITEMS_BY_IDS,
        variables: { ids: ids.map(String) },
        fetchPolicy: "cache-first",
      }
    );

    const mediaItems = data?.mediaItems?.nodes ?? [];
    const mediaMap = new Map<number, MediaItemForSrcSet>();

    mediaItems
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .forEach((item) => {
        mediaMap.set(item.databaseId, item);
      });

    return mediaMap;
  } catch (e) {
    console.error("Error loading media items by IDs:", e);
    return new Map();
  }
};

// Obtiene solo slugs, id y títulos de las páginas publicadas
export const getPagesSlugs = async (): Promise<Pick<WPMenuItem, "id" | "slug" | "title" | "menuOrder">[]> => {
  try {
    const { data } = await client.query<GetAllPageSlugsQuery>(
      {
        query: GetAllPageSlugsDocument,
        fetchPolicy: "cache-first",
      }
    );
    const nodes = data?.pages?.nodes || [];
    return nodes
      .filter((node) => node.slug && node.title)
      .map((node) => ({
        id: node.id,
        slug: node.slug ?? "",
        title: node.title ?? "",
        menuOrder: node.menuOrder ?? null,
      }));
  } catch (e) {
    console.error("Error loading page slugs/titles:", e);
    return [];
  }
};

// Obtiene todas las páginas con información completa
export const getAllPages = async (): Promise<WordPressPage[]> => {
  try {
    const { data } = await client.query<GetAllPagesQuery>(
      {
        query: GetAllPagesDocument,
        fetchPolicy: "cache-first",
      }
    );
    const nodes = data?.pages?.nodes || [];
    return nodes.map((node) => ({
      id: node.id,
      title: node.title ?? "",
      slug: node.slug ?? "",
      content: undefined,
    }));
  } catch (e) {
    console.error("Error loading all pages:", e);
    return [];
  }
};

export const getPageBySlug = async (
  slug: string
): Promise<GetPageBySlugQuery["page"] | null> => {
   try {
    const { data } = await client.query<GetPageBySlugQuery, GetPageBySlugQueryVariables>(
      {
        query: GET_PAGE_BY_SLUG,
        variables: { slug },
        fetchPolicy: "cache-first",
      }
    );
    const page = data?.page ?? null;
    const content = page?.content ?? "";
    if (!page || !content) {
      return page;
    }

    const imageIds = extractWordPressImageIds(content);
    if (imageIds.length === 0) {
      return page;
    }

    const mediaById = await getMediaItemsByIds(imageIds);
    if (mediaById.size === 0) {
      return page;
    }

    return {
      ...page,
      content: injectSrcSetInHtmlContent(content, mediaById),
    };
  } catch (e) {
    console.error("Error loading page by slug:", e);
    return null;
  }
};

export const getAllPosts = async (first = 20): Promise<BlogPostListItem[]> => {
  try {
    const { data } = await client.query<GetPostsListQuery, GetPostsListQueryVariables>({
      query: GET_POSTS,
      variables: { first },
      fetchPolicy: "network-only",
    });

    const nodes = (data?.posts?.nodes ?? []).filter(
      (post): post is NonNullable<typeof post> => Boolean(post)
    );

    return nodes.map((post) => ({
      id: post.id,
      slug: post.slug ?? "",
      title: post.title ?? "",
      excerpt: post.excerpt ?? "",
      date: post.date ?? null,
      featuredImage: post.featuredImage?.node?.sourceUrl
        ? {
            sourceUrl: post.featuredImage.node.sourceUrl,
            altText: post.featuredImage.node.altText ?? null,
          }
        : undefined,
    }));
  } catch (e) {
    console.error("Error loading posts:", e);
    return [];
  }
};

export const getPostBySlug = async (slug: string): Promise<BlogPostDetail | null> => {
  try {
    const { data } = await client.query<GetPostBySlugQuery, GetPostBySlugQueryVariables>({
      query: GET_POST_BY_SLUG,
      variables: { slug },
      fetchPolicy: "network-only",
    });

    const post = data?.post;
    if (!post) {
      return null;
    }

    return {
      id: post.id,
      slug: post.slug ?? "",
      title: post.title ?? "",
      content: post.content ?? "",
      excerpt: post.excerpt ?? "",
      date: post.date ?? null,
      seo: post.seo ?? null,
      featuredImage: post.featuredImage?.node?.sourceUrl
        ? {
            sourceUrl: post.featuredImage.node.sourceUrl,
            altText: post.featuredImage.node.altText ?? null,
          }
        : undefined,
    };
  } catch (e) {
    console.error("Error loading post by slug:", e);
    return null;
  }
};

// Obtener todas las galerías
export const getAllGalerias = async (): Promise<Galeria[]> => {
  try {
    const { data } = await client.query<GetAllGaleriasQuery>(
      {
        query: GET_ALL_GALERIAS,
        fetchPolicy: "cache-first",
      }
    );
    const nodes = data?.galerias?.nodes || [];
    return nodes.map((node) => ({
      id: node.id,
      title: node.title ?? "",
      slug: node.slug ?? "",
      galeriaMostrarEnFrontend: (node as { galeriaMostrarEnFrontend?: boolean | null }).galeriaMostrarEnFrontend ?? null,
      seo: (node as { seo?: { title?: string | null; metaDesc?: string | null } | null }).seo ?? null,
      galeriaImagenes: node.galeriaImagenes
        ?.filter((img): img is NonNullable<typeof img> => Boolean(img))
        .map((img) => ({
          sourceUrl: img.sourceUrl ?? "",
          mediaItemUrl: img.mediaItemUrl ?? undefined,
          altText: img.altText ?? null,
          mediaDetails: img.mediaDetails
            ? {
                width: img.mediaDetails.width ?? 0,
                height: img.mediaDetails.height ?? 0,
                sizes: img.mediaDetails.sizes
                  ?.filter((size): size is NonNullable<typeof size> => Boolean(size))
                  .map((size) => ({
                    name: size.name ?? "",
                    sourceUrl: size.sourceUrl ?? "",
                    width: size.width ?? 0,
                    height: size.height ?? 0,
                  })),
              }
            : undefined,
        })),
    }));
  } catch (e) {
    console.error("Error loading galerias:", e);
    return [];
  }
};

// Obtener galería por slug
export const getGaleriaBySlug = async (slug: string): Promise<Galeria | null> => {
  try {
    const { data } = await client.query<GetGaleriaBySlugQuery, GetGaleriaBySlugQueryVariables>(
      {
        query: GET_GALERIA_BY_SLUG,
        variables: { slug },
        fetchPolicy: "cache-first",
      }
    );
    if (!data?.galeria) return null;
    return {
      id: data.galeria.id,
      title: data.galeria.title ?? "",
      slug: data.galeria.slug ?? "",
      galeriaImagenes: data.galeria.galeriaImagenes
        ?.filter((img): img is NonNullable<typeof img> => Boolean(img))
        .map((img) => ({
          sourceUrl: img.sourceUrl ?? "",
          mediaItemUrl: img.mediaItemUrl ?? undefined,
          altText: img.altText ?? null,
          mediaDetails: img.mediaDetails
            ? {
                width: img.mediaDetails.width ?? 0,
                height: img.mediaDetails.height ?? 0,
                sizes: img.mediaDetails.sizes
                  ?.filter((size): size is NonNullable<typeof size> => Boolean(size))
                  .map((size) => ({
                    name: size.name ?? "",
                    sourceUrl: size.sourceUrl ?? "",
                    width: size.width ?? 0,
                    height: size.height ?? 0,
                  })),
              }
            : undefined,
        })),
    };
  } catch (e) {
    console.error("Error loading galeria by slug:", e);
    return null;
  }
};