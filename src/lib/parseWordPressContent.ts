export type ParsedContentImage = {
  id: string;
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
};

export type ParsedContentGallery = {
  id: string;
  className: string;
  images: ParsedContentImage[];
};

export type ParsedWordPressContent = {
  paragraphs: string[];
  images: ParsedContentImage[];
  galleries: ParsedContentGallery[];
};

const extractImageId = (img: HTMLImageElement, index: number): string => {
  const classMatch = img.className.match(/wp-image-(\d+)/i);
  if (classMatch?.[1]) {
    return classMatch[1];
  }

  const dataId = img.getAttribute("data-id");
  if (dataId) {
    return dataId;
  }

  return `content-image-${index + 1}`;
};

export const parseWordPressContent = (html?: string | null): ParsedWordPressContent => {
  if (!html || typeof DOMParser === "undefined") {
    return { paragraphs: [], images: [], galleries: [] };
  }

  const documentHtml = new DOMParser().parseFromString(html, "text/html");

  const paragraphs = Array.from(documentHtml.querySelectorAll("p"))
    .map((paragraph) => paragraph.textContent?.trim() ?? "")
    .filter(Boolean);

  const mapImageElement = (
    img: HTMLImageElement,
    index: number,
  ): ParsedContentImage | null => {
      const src = img.getAttribute("src")?.trim() ?? "";
      if (!src) return null;

      const alt = img.getAttribute("alt")?.trim() ?? "";
      const srcSet = img.getAttribute("srcset")?.trim() || undefined;
      const sizes = img.getAttribute("sizes")?.trim() || undefined;

      return {
        id: extractImageId(img, index),
        src,
        alt,
        srcSet,
        sizes,
      };
    };

  const galleries = Array.from(documentHtml.querySelectorAll("figure.wp-block-gallery")).map(
    (galleryElement, galleryIndex) => {
      const galleryClass = galleryElement.className;
      const galleryIdFromClass = galleryClass.match(/wp-block-gallery-(\d+)/i)?.[1];

      const galleryImages = Array.from(galleryElement.querySelectorAll("img"))
        .map((img, imageIndex) => mapImageElement(img, imageIndex))
        .filter((img): img is ParsedContentImage => Boolean(img));

      return {
        id: galleryIdFromClass ?? `gallery-${galleryIndex + 1}`,
        className: galleryClass,
        images: galleryImages,
      };
    },
  );

  const images = Array.from(documentHtml.querySelectorAll("img"))
    .map((img, index) => mapImageElement(img, index))
    .filter((img): img is ParsedContentImage => Boolean(img));

  return {
    paragraphs,
    images,
    galleries,
  };
};