import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";

const workspaceRoot = process.cwd();
const distDir = path.join(workspaceRoot, "dist");

[
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
].forEach((fileName) => {
  dotenv.config({ path: path.join(workspaceRoot, fileName), override: true });
});

const siteName = "Disorder Underground Shop";
const siteUrl = (
  process.env.VITE_SITE_URL ||
  process.env.VITE_FRONTEND_URL ||
  "https://www.disorderunderground.es"
).replace(/\/$/, "");
const graphqlUrl = (process.env.VITE_WORDPRESS_GRAPHQL_URL || "").trim();

const staticRouteSeo = [
  {
    path: "/blogs",
    title: "Blog | Disorder Underground Shop",
    description: "Noticias, trabajos y novedades de Disorder Underground Shop.",
  },
  {
    path: "/mapa-del-sitio",
    title: "Mapa Del Sitio | Disorder Underground Shop",
    description: "Mapa del sitio de Disorder Underground Shop.",
  },
];

const slugToPath = (slug) => {
  if (!slug || slug === "inicio") {
    return "/";
  }

  if (slug === "blog") {
    return "/blogs";
  }

  return `/${slug}`;
};

const toAbsoluteUrl = (value, fallbackPath = "/") => {
  if (!value) {
    return `${siteUrl}${fallbackPath}`;
  }

  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return `${siteUrl}${fallbackPath}`;
  }
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeText = (value, fallback = "") => {
  if (!value) {
    return fallback;
  }

  return String(value).replace(/\s+/g, " ").trim() || fallback;
};

const trimWpTitle = (value) => {
  if (!value) {
    return "";
  }

  return value.replace(/\s*[\-|\u2013|\u2014]\s*[^\-|\u2013|\u2014]+$/u, "").trim();
};

const isObject = (value) => typeof value === "object" && value !== null;

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} en ${url}`);
  }

  try {
    return JSON.parse(raw);
  } catch {
    const snippet = raw.replace(/\s+/g, " ").slice(0, 160);
    throw new Error(`JSON invalido en ${url}: ${snippet}`);
  }
};

const fetchSeoData = async () => {
  if (!graphqlUrl) {
    console.warn("[prerender-seo] VITE_WORDPRESS_GRAPHQL_URL no definido. Se omite prerender SEO dinamico.");
    return [];
  }

  const query = `
    query SeoPrerenderEntries {
      pages(where: { status: PUBLISH }) {
        nodes {
          slug
          title
          seo {
            title
            metaDesc
            opengraphTitle
            opengraphDescription
            canonical
            opengraphImage {
              sourceUrl
            }
          }
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
      }
      posts(first: 200, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
        nodes {
          slug
          title
          seo {
            title
            metaDesc
            opengraphTitle
            opengraphDescription
            canonical
            opengraphImage {
              sourceUrl
            }
          }
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
      }
    }
  `;

  const payload = await fetchJson(graphqlUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    throw new Error(payload.errors[0]?.message || "Error GraphQL desconocido");
  }

  const pageNodes = Array.isArray(payload?.data?.pages?.nodes)
    ? payload.data.pages.nodes
    : [];
  const postNodes = Array.isArray(payload?.data?.posts?.nodes)
    ? payload.data.posts.nodes
    : [];

  const pageEntries = pageNodes
    .filter((node) => isObject(node) && typeof node.slug === "string")
    .map((node) => {
      const pathName = slugToPath(node.slug);
      const seo = isObject(node.seo) ? node.seo : null;
      const ogImage =
        (isObject(seo?.opengraphImage) ? seo.opengraphImage.sourceUrl : null) ||
        (isObject(node.featuredImage) && isObject(node.featuredImage.node)
          ? node.featuredImage.node.sourceUrl
          : null);

      return {
        path: pathName,
        title: normalizeText(trimWpTitle(seo?.title) || node.title, "Disorder Underground Shop"),
        description: normalizeText(
          seo?.metaDesc || seo?.opengraphDescription,
          "Disorder Underground Shop",
        ),
        ogTitle: normalizeText(seo?.opengraphTitle || trimWpTitle(seo?.title) || node.title, "Disorder Underground Shop"),
        ogDescription: normalizeText(
          seo?.opengraphDescription || seo?.metaDesc,
          "Disorder Underground Shop",
        ),
        canonical: normalizeText(seo?.canonical || `${siteUrl}${pathName}`),
        image: normalizeText(ogImage || ""),
      };
    });

  const postEntries = postNodes
    .filter((node) => isObject(node) && typeof node.slug === "string")
    .map((node) => {
      const pathName = `/blogs/${node.slug}`;
      const seo = isObject(node.seo) ? node.seo : null;
      const ogImage =
        (isObject(seo?.opengraphImage) ? seo.opengraphImage.sourceUrl : null) ||
        (isObject(node.featuredImage) && isObject(node.featuredImage.node)
          ? node.featuredImage.node.sourceUrl
          : null);

      return {
        path: pathName,
        title: normalizeText(trimWpTitle(seo?.title) || node.title, "Blog | Disorder Underground Shop"),
        description: normalizeText(
          seo?.metaDesc || seo?.opengraphDescription,
          "Blog de Disorder Underground Shop",
        ),
        ogTitle: normalizeText(seo?.opengraphTitle || trimWpTitle(seo?.title) || node.title, "Blog | Disorder Underground Shop"),
        ogDescription: normalizeText(
          seo?.opengraphDescription || seo?.metaDesc,
          "Blog de Disorder Underground Shop",
        ),
        canonical: normalizeText(seo?.canonical || `${siteUrl}${pathName}`),
        image: normalizeText(ogImage || ""),
      };
    });

  const staticEntries = staticRouteSeo.map((entry) => ({
    path: entry.path,
    title: entry.title,
    description: entry.description,
    ogTitle: entry.title,
    ogDescription: entry.description,
    canonical: `${siteUrl}${entry.path}`,
    image: "",
  }));

  const routeMap = new Map();
  [...staticEntries, ...pageEntries, ...postEntries].forEach((entry) => {
    routeMap.set(entry.path, entry);
  });

  return [...routeMap.values()];
};

const removeManagedSeoTags = (html) => {
  return html
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+[^>]*name=["']description["'][^>]*>\s*/gi, "")
    .replace(/<meta\s+[^>]*name=["']robots["'][^>]*>\s*/gi, "")
    .replace(/<meta\s+[^>]*property=["']og:[^"']+["'][^>]*>\s*/gi, "")
    .replace(/<meta\s+[^>]*name=["']twitter:[^"']+["'][^>]*>\s*/gi, "")
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, "");
};

const buildSeoBlock = (entry) => {
  const canonical =
    entry.path === "/"
      ? `${siteUrl}/`
      : toAbsoluteUrl(entry.canonical, entry.path);
  const ogImage = entry.image ? toAbsoluteUrl(entry.image, entry.path) : "";

  const lines = [
    `    <title>${escapeHtml(entry.title)}</title>`,
    `    <meta name="description" content="${escapeHtml(entry.description)}" />`,
    '    <meta name="robots" content="index,follow" />',
    `    <meta property="og:title" content="${escapeHtml(entry.ogTitle || entry.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(entry.ogDescription || entry.description)}" />`,
    `    <meta property="og:url" content="${escapeHtml(canonical)}" />`,
    '    <meta property="og:type" content="website" />',
    `    <meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    `    <meta name="twitter:title" content="${escapeHtml(entry.ogTitle || entry.title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(entry.ogDescription || entry.description)}" />`,
    `    <meta name="twitter:card" content="${ogImage ? "summary_large_image" : "summary"}" />`,
    `    <link rel="canonical" href="${escapeHtml(canonical)}" />`,
  ];

  if (ogImage) {
    lines.splice(6, 0, `    <meta property="og:image" content="${escapeHtml(ogImage)}" />`);
    lines.splice(12, 0, `    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />`);
  }

  return lines.join("\n");
};

const ensureRouteHtml = async (baseHtml, entry) => {
  const cleaned = removeManagedSeoTags(baseHtml);
  const seoBlock = buildSeoBlock(entry);
  const withSeo = cleaned.replace("</head>", `${seoBlock}\n  </head>`);

  const routePath = entry.path === "/" ? "" : entry.path.replace(/^\//, "");
  const outputDir = path.join(distDir, routePath);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "index.html"), withSeo, "utf8");
};

const main = async () => {
  const sourceHtmlPath = path.join(distDir, "index.html");
  let sourceHtml;

  try {
    sourceHtml = await fs.readFile(sourceHtmlPath, "utf8");
  } catch {
    console.warn("[prerender-seo] dist/index.html no existe. Ejecuta vite build antes.");
    return;
  }

  let entries = [];
  try {
    entries = await fetchSeoData();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[prerender-seo] Error cargando SEO desde WordPress: ${message}`);
  }

  if (entries.length === 0) {
    const fallbackEntry = {
      path: "/",
      title: "Disorder Underground Shop",
      description: "Disorder Underground Shop: tatuaje, serigrafia, diseno grafico e ilustracion desde San Pedro Alcantara.",
      ogTitle: "Disorder Underground Shop",
      ogDescription: "Disorder Underground Shop: tatuaje, serigrafia, diseno grafico e ilustracion desde San Pedro Alcantara.",
      canonical: `${siteUrl}/`,
      image: "",
    };

    await ensureRouteHtml(sourceHtml, fallbackEntry);
    console.log("[prerender-seo] Sin entradas dinamicas. Se genero solo SEO para /.");
    return;
  }

  await Promise.all(entries.map((entry) => ensureRouteHtml(sourceHtml, entry)));
  console.log(`[prerender-seo] Generadas ${entries.length} rutas con metadatos SEO prerenderizados.`);
};

main().catch((error) => {
  console.error("[prerender-seo] Error en prerender SEO:", error);
  process.exitCode = 1;
});
