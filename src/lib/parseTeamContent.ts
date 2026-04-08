export type ParsedTeamArtist = {
  name: string;
  descriptionHtml: string;
  leadTitleHtml?: string;
  leadImage?: {
    src: string;
    alt: string;
    srcSet?: string;
    sizes?: string;
  };
  gallerySlug?: string;
};

import { normalizeWordPressSrcSet, normalizeWordPressUrl } from "./normalizeWordPressUrl";

const isArtistHeading = (element: Element) =>
  element.tagName.toLowerCase() === "h2" &&
  (element.hasAttribute("data-gallery-slug") || element.hasAttribute("data-slug"));

const collectDescriptionUntilNextHeading = (heading: Element): string => {
  const descriptionParts: string[] = [];
  let sibling = heading.nextElementSibling;

  while (sibling && !isArtistHeading(sibling)) {
    const html = sibling.outerHTML?.trim();
    if (html) {
      descriptionParts.push(html);
    }
    sibling = sibling.nextElementSibling;
  }

  return descriptionParts.join("\n");
};

const removeEmptyElements = (root: HTMLElement) => {
  const elements = Array.from(root.querySelectorAll("*"));

  elements.reverse().forEach((element) => {
    const hasElementChildren = element.children.length > 0;
    const hasText = Boolean(element.textContent?.trim());
    const isVoidElement = ["IMG", "BR", "HR"].includes(element.tagName);

    if (!hasElementChildren && !hasText && !isVoidElement) {
      element.remove();
    }
  });
};

const normalizeArtistContent = (html: string) => {
  const container = document.createElement("div");
  container.innerHTML = html;

  const leadTitleElement = container.querySelector("h1, h2, h3");
  const leadTitleHtml = leadTitleElement?.innerHTML.trim() || undefined;
  leadTitleElement?.remove();

  const leadImageElement = container.querySelector("img");
  const leadImage = leadImageElement?.getAttribute("src")
    ? {
        src: normalizeWordPressUrl(leadImageElement.getAttribute("src") || ""),
        alt: leadImageElement.getAttribute("alt") || "",
        srcSet: normalizeWordPressSrcSet(leadImageElement.getAttribute("srcset") || undefined),
        sizes: leadImageElement.getAttribute("sizes") || undefined,
      }
    : undefined;

  if (leadImageElement) {
    const imageWrapper =
      leadImageElement.closest(".wp-block-image") ||
      leadImageElement.closest("figure") ||
      leadImageElement;
    imageWrapper.remove();
  }

  removeEmptyElements(container);

  return {
    leadTitleHtml,
    leadImage,
    descriptionHtml: container.innerHTML.trim(),
  };
};

export const parseTeamContent = (html?: string | null): ParsedTeamArtist[] => {
  if (!html || typeof DOMParser === "undefined") {
    return [];
  }

  const documentHtml = new DOMParser().parseFromString(html, "text/html");
  const headings = Array.from(
    documentHtml.querySelectorAll("h2[data-gallery-slug], h2[data-slug]"),
  );

  return headings
    .map((heading) => {
      const name = heading.textContent?.trim() ?? "";
      if (!name) return null;

      const gallerySlug =
        heading.getAttribute("data-gallery-slug")?.trim() ||
        heading.getAttribute("data-slug")?.trim() ||
        undefined;
      const normalizedContent = normalizeArtistContent(
        collectDescriptionUntilNextHeading(heading),
      );

      const artist: ParsedTeamArtist = {
        name,
        descriptionHtml: normalizedContent.descriptionHtml,
      };

      if (normalizedContent.leadTitleHtml) {
        artist.leadTitleHtml = normalizedContent.leadTitleHtml;
      }

      if (normalizedContent.leadImage) {
        artist.leadImage = normalizedContent.leadImage;
      }

      if (gallerySlug) {
        artist.gallerySlug = gallerySlug;
      }

      return artist;
    })
    .filter((artist): artist is ParsedTeamArtist => artist !== null);
};
