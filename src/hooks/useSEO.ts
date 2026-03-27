import { useEffect } from "react";
import { buildAbsoluteUrl, siteName } from "../config/site";

type SeoImage = {
  sourceUrl?: string | null;
} | null;

type SeoData = {
  title?: string | null;
  metaDesc?: string | null;
  opengraphTitle?: string | null;
  opengraphDescription?: string | null;
  opengraphImage?: SeoImage;
  canonical?: string | null;
} | null | undefined;

type FallbackSeo = {
  title?: string;
  description?: string;
};

function upsertMeta(attr: "name" | "property", key: string, content?: string | null) {
  if (!content) return;
  let tag = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertLink(rel: string, href?: string | null) {
  if (!href) return;
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

export default function useSEO(seo: SeoData, fallback: FallbackSeo = {}) {
  useEffect(() => {
    const title = seo?.title || fallback.title;
    if (title) {
      document.title = title;
    }

    const description = seo?.metaDesc || fallback.description;
    const canonicalUrl =
      seo?.canonical ||
      (typeof window !== "undefined"
        ? buildAbsoluteUrl(window.location.pathname)
        : undefined);

    upsertMeta("name", "description", description || undefined);
    upsertMeta("name", "robots", "index,follow");

    upsertMeta("property", "og:title", seo?.opengraphTitle || title || undefined);
    upsertMeta("property", "og:description", seo?.opengraphDescription || description || undefined);
    upsertMeta("property", "og:image", seo?.opengraphImage?.sourceUrl || undefined);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", siteName);

    upsertMeta("name", "twitter:title", seo?.opengraphTitle || title || undefined);
    upsertMeta("name", "twitter:description", seo?.opengraphDescription || description || undefined);
    upsertMeta("name", "twitter:image", seo?.opengraphImage?.sourceUrl || undefined);
    upsertMeta(
      "name",
      "twitter:card",
      seo?.opengraphImage?.sourceUrl ? "summary_large_image" : "summary",
    );

    upsertLink("canonical", canonicalUrl);
  }, [seo, fallback.title, fallback.description]);
}
