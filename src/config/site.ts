const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

const fallbackOrigin =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

export const siteName = "Disorder Underground Shop";
export const siteUrl = trimTrailingSlash(
  import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_FRONTEND_URL ||
    fallbackOrigin,
);
export const contactEmail =
  import.meta.env.VITE_CONTACT_EMAIL || "info@disorderunderground.com";
export const whatsappNumber =
  import.meta.env.VITE_WHATSAPP_NUMBER || "+34 623 61 29 05";
export const whatsappMessage =
  import.meta.env.VITE_WHATSAPP_MESSAGE ||
  "Hola, me gustaria pedir informacion sobre Disorder Underground Shop.";

export const buildAbsoluteUrl = (pathname = "/") => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteUrl}${normalizedPath}`;
};

export const getWhatsappHref = (message = whatsappMessage) => {
  const normalizedNumber = whatsappNumber.replace(/\D/g, "");

  if (!normalizedNumber) {
    return "";
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedNumber}?text=${encodedMessage}`;
};
