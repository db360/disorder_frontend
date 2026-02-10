import client from "../api/graphql/client";
import {
  GetAllPageSlugsDocument,
  GetAllPagesDocument,
  GetGaleriaBySlugDocument,
  type GetAllPageSlugsQuery,
  type GetAllPagesQuery,
  type GetPageBySlugQuery,
  type GetPageBySlugQueryVariables,
  type GetAllGaleriasQuery,
  type GetGaleriaBySlugQuery,
  type GetGaleriaBySlugQueryVariables,
} from "../api/graphql/generated";
import { GET_ALL_GALERIAS, GET_PAGE_BY_SLUG } from "../api/graphql/queries";

import type { WordPressPage, WPMenuItem, Galeria } from "../types/wordpress";

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
    return data?.page ?? null;
  } catch (e) {
    console.error("Error loading page by slug:", e);
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
        query: GetGaleriaBySlugDocument,
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