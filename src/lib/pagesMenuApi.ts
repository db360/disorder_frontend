import { gql } from "@apollo/client";
import client from "../api/graphql/client";
import type { WPMenuItem } from "../types/wordpress";

type GetAllPageSlugsResponse = {
  pages?: {
    nodes?: Array<{
      id: string;
      slug?: string | null;
      title?: string | null;
      menuOrder?: number | null;
    } | null> | null;
  } | null;
};

const GET_MENU_PAGE_SLUGS = gql`
  query GetMenuPageSlugs {
    pages(where: { status: PUBLISH }) {
      nodes {
        id
        slug
        title
        menuOrder
      }
    }
  }
`;

export const getMenuPageSlugs = async (): Promise<
  Pick<WPMenuItem, "id" | "slug" | "title" | "menuOrder">[]
> => {
  try {
    const { data } = await client.query<GetAllPageSlugsResponse>({
      query: GET_MENU_PAGE_SLUGS,
      fetchPolicy: "cache-first",
    });

    const nodes = data?.pages?.nodes ?? [];
    return nodes
      .filter((node): node is NonNullable<typeof node> => Boolean(node))
      .filter((node) => Boolean(node.slug) && Boolean(node.title))
      .map((node) => ({
        id: node.id,
        slug: node.slug ?? "",
        title: node.title ?? "",
        menuOrder: node.menuOrder ?? null,
      }));
  } catch (e) {
    console.error("Error loading menu page slugs:", e);
    return [];
  }
};
