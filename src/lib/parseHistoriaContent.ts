export type ParsedHistoriaSection = {
  title: string;
  content: string;
  gallerySlug?: string;
};

const collectContentUntilNextHeading = (heading: Element): string => {
  const contentParts: string[] = [];
  let sibling = heading.nextElementSibling;

  while (sibling && !["h2", "h3"].includes(sibling.tagName.toLowerCase())) {
    if (sibling.tagName.toLowerCase() === "p") {
      const text = sibling.textContent?.trim();
      if (text) {
        contentParts.push(text);
      }
    }
    sibling = sibling.nextElementSibling;
  }

  return contentParts.join("\n\n");
};

export const parseHistoriaContent = (html?: string | null): ParsedHistoriaSection[] => {
  if (!html || typeof DOMParser === "undefined") {
    return [];
  }

  const documentHtml = new DOMParser().parseFromString(html, "text/html");
  const headings = Array.from(documentHtml.querySelectorAll("h2, h3"));

  return headings
    .map((heading) => {
      const title = heading.textContent?.trim() ?? "";
      if (!title) return null;

      const gallerySlug =
        heading.getAttribute("data-gallery-slug")?.trim() ||
        heading.getAttribute("data-slug")?.trim();

      return {
        title,
        content: collectContentUntilNextHeading(heading),
        ...(gallerySlug && { gallerySlug }),
      };
    })
    .filter((section): section is ParsedHistoriaSection => Boolean(section));
};
