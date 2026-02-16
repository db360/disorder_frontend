export type ParsedTeamArtist = {
  name: string;
  description: string;
  gallerySlug?: string;
};

const collectDescriptionUntilNextHeading = (heading: Element): string => {
  const descriptionParts: string[] = [];
  let sibling = heading.nextElementSibling;

  while (sibling && sibling.tagName.toLowerCase() !== "h2") {
    if (sibling.tagName.toLowerCase() === "p") {
      const text = sibling.textContent?.trim();
      if (text) {
        descriptionParts.push(text);
      }
    }
    sibling = sibling.nextElementSibling;
  }

  return descriptionParts.join("\n\n");
};

export const parseTeamContent = (html?: string | null): ParsedTeamArtist[] => {
  if (!html || typeof DOMParser === "undefined") {
    return [];
  }

  const documentHtml = new DOMParser().parseFromString(html, "text/html");
  const headings = Array.from(documentHtml.querySelectorAll("h2"));

  return headings
    .map((heading) => {
      const name = heading.textContent?.trim() ?? "";
      if (!name) return null;

      const gallerySlug =
        heading.getAttribute("data-gallery-slug")?.trim() ||
        heading.getAttribute("data-slug")?.trim() ||
        undefined;

      return {
        name,
        description: collectDescriptionUntilNextHeading(heading),
        gallerySlug,
      };
    })
    .filter((artist): artist is ParsedTeamArtist => Boolean(artist));
};
