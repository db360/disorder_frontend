import client from "../api/graphql/client";
import { GET_ALL_PAGE_SLUGS, GET_ALL_PAGES } from "../api/graphql/queries";
import type { WordPressPage, WPMenuItem } from "../types/wordpress";

// Obtiene solo slugs, id y títulos de las páginas publicadas
export const getPagesSlugs = async (): Promise<Pick<WPMenuItem, "id" | "slug" | "title">[]> => {
  try {
    const { data } = await client.query<{ pages: { nodes: Pick<WPMenuItem, "id" | "slug" | "title">[] } }>(
      {
        query: GET_ALL_PAGE_SLUGS,
        fetchPolicy: "cache-first",
      }
    );
    return data?.pages?.nodes || [];
  } catch (e) {
    console.error("Error loading page slugs/titles:", e);
    return [];
  }
};

// Obtiene todas las páginas con información completa
export const getAllPages = async (): Promise<WordPressPage[]> => {
  try {
    const { data } = await client.query<{ pages: { nodes: WordPressPage[] } }>(
      {
        query: GET_ALL_PAGES,
        fetchPolicy: "cache-first",
      }
    );
    return data?.pages?.nodes || [];
  } catch (e) {
    console.error("Error loading all pages:", e);
    return [];
  }
};
