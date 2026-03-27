const BLOCKED_PORT = "8883";

const stripBlockedPortInString = (value: string): string =>
  value.replace(new RegExp(`:${BLOCKED_PORT}(?=/|$)`, "g"), "");

const fallbackOrigin = typeof window !== "undefined" ? window.location.origin : "";

const preferredOrigin = (
  import.meta.env.VITE_WORDPRESS_URL ||
  import.meta.env.VITE_FRONTEND_URL ||
  fallbackOrigin
)
  .replace(/\/$/, "")
  .replace(new RegExp(`:${BLOCKED_PORT}$`), "");

const preferredUrl = (() => {
  if (!preferredOrigin) {
    return null;
  }

  try {
    return new URL(preferredOrigin);
  } catch {
    return null;
  }
})();

const localhostHosts = new Set(["localhost", "127.0.0.1", "::1"]);

const stripBlockedPortInUrl = (url: URL): void => {
  if (url.port === BLOCKED_PORT) {
    url.port = "";
  }
};

const toPreferredUrl = (url: URL): string => {
  if (!preferredUrl) {
    return url.toString();
  }

  url.protocol = preferredUrl.protocol;
  url.host = preferredUrl.host;
  return url.toString();
};

const hasNonPreferredPort = (url: URL): boolean => {
  if (!preferredUrl) {
    return false;
  }

  return url.hostname === preferredUrl.hostname && url.host !== preferredUrl.host;
};

export const normalizeWordPressUrl = (value?: string | null): string => {
  const raw = stripBlockedPortInString((value || "").trim());
  if (!raw) {
    return "";
  }

  // In development, return relative paths so Vite proxy handles WordPress assets.
  if (import.meta.env.DEV) {
    if (raw.startsWith("/")) {
      return raw;
    }
    try {
      const url = new URL(raw);
      if (localhostHosts.has(url.hostname) || url.hostname.endsWith(".local")) {
        return url.pathname;
      }
    } catch {
      // fall through to production logic
    }
  }

  if (raw.startsWith("/")) {
    return preferredOrigin ? `${preferredOrigin}${raw}` : raw;
  }

  try {
    const url = new URL(raw);
    stripBlockedPortInUrl(url);

    if (
      localhostHosts.has(url.hostname) ||
      url.hostname.endsWith(".local") ||
      hasNonPreferredPort(url)
    ) {
      return toPreferredUrl(url);
    }

    return url.toString();
  } catch {
    return raw;
  }
};

export const normalizeWordPressSrcSet = (value?: string | null): string | undefined => {
  const raw = (value || "").trim();
  if (!raw) {
    return undefined;
  }

  const entries = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [urlPart, descriptor] = entry.split(/\s+/, 2);
      const normalizedUrl = normalizeWordPressUrl(urlPart);
      return descriptor ? `${normalizedUrl} ${descriptor}` : normalizedUrl;
    });

  return entries.length > 0 ? entries.join(", ") : undefined;
};
