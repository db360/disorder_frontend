import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";

const workspaceRoot = process.cwd();
const publicDir = path.join(workspaceRoot, "public");

[
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
].forEach((fileName) => {
  dotenv.config({ path: path.join(workspaceRoot, fileName), override: true });
});

const siteUrl = (
  process.env.VITE_SITE_URL ||
  process.env.VITE_FRONTEND_URL ||
  "https://www.disorderunderground.es"
).replace(/\/$/, "");
const graphqlUrl = process.env.VITE_WORDPRESS_GRAPHQL_URL;
const wordpressUrl = (
  process.env.VITE_WORDPRESS_URL ||
  process.env.VITE_FRONTEND_URL ||
  "https://www.disorderunderground.es"
).replace(/\/$/, "");

const staticEntries = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/blogs", priority: "0.8", changefreq: "weekly" },
  { path: "/mapa-del-sitio", priority: "0.5", changefreq: "monthly" },
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

const buildUrl = (pathname) => `${siteUrl}${pathname}`;

const formatDate = (value) => {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const uniqueByPath = (entries) => {
  const map = new Map();

  entries.forEach((entry) => {
    map.set(entry.path, entry);
  });

  return [...map.values()];
};

const extractSnippet = (text) => text.replace(/\s+/g, " ").trim().slice(0, 120);

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const raw = await response.text();
  const contentType = (response.headers.get("content-type") || "").toLowerCase();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} en ${url}`);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Respuesta no JSON en ${url}: ${extractSnippet(raw)}`);
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`JSON invalido en ${url}: ${extractSnippet(raw)}`);
  }
};

const fetchWordPressEntriesFromRest = async () => {
  const restBase = `${wordpressUrl}/wp-json/wp/v2`;
  const pagesUrl = `${restBase}/pages?per_page=100&_fields=slug,modified`;
  const postsUrl = `${restBase}/posts?per_page=100&_fields=slug,modified,date`;

  const [pages, posts] = await Promise.all([
    fetchJson(pagesUrl),
    fetchJson(postsUrl),
  ]);

  const pageEntries = (Array.isArray(pages) ? pages : [])
    .filter((page) => Boolean(page?.slug) && page.slug !== "blog")
    .map((page) => ({
      path: slugToPath(page.slug),
      lastmod: formatDate(page.modified),
      priority: page.slug === "inicio" ? "1.0" : "0.7",
      changefreq: "weekly",
    }));

  const postEntries = (Array.isArray(posts) ? posts : [])
    .filter((post) => Boolean(post?.slug))
    .map((post) => ({
      path: `/blogs/${post.slug}`,
      lastmod: formatDate(post.modified || post.date),
      priority: "0.6",
      changefreq: "monthly",
    }));

  return [...pageEntries, ...postEntries];
};

const fetchWordPressEntries = async () => {
  if (!graphqlUrl) {
    console.warn("[sitemap] VITE_WORDPRESS_GRAPHQL_URL no definido. Se generara un sitemap solo con rutas estaticas.");
    return [];
  }

  const query = `
    query SitemapEntries {
      pages(where: { status: PUBLISH }) {
        nodes {
          slug
          modified
        }
      }
      posts(first: 100, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
        nodes {
          slug
          modified
          date
        }
      }
    }
  `;

  try {
    const payload = await fetchJson(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (payload?.errors?.length) {
      const firstError = payload.errors[0]?.message || "Error GraphQL desconocido";
      throw new Error(firstError);
    }

    const pageEntries = (payload?.data?.pages?.nodes ?? [])
      .filter((page) => Boolean(page?.slug) && page.slug !== "blog")
      .map((page) => ({
        path: slugToPath(page.slug),
        lastmod: formatDate(page.modified),
        priority: page.slug === "inicio" ? "1.0" : "0.7",
        changefreq: "weekly",
      }));

    const postEntries = (payload?.data?.posts?.nodes ?? [])
      .filter((post) => Boolean(post?.slug))
      .map((post) => ({
        path: `/blogs/${post.slug}`,
        lastmod: formatDate(post.modified || post.date),
        priority: "0.6",
        changefreq: "monthly",
      }));

    return [...pageEntries, ...postEntries];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[sitemap] GraphQL no disponible (${message}). Probando REST API...`);

    try {
      return await fetchWordPressEntriesFromRest();
    } catch (restError) {
      const restMessage = restError instanceof Error ? restError.message : String(restError);
      console.warn(`[sitemap] Tampoco se pudieron cargar rutas desde REST: ${restMessage}`);
      return [];
    }
  }
};

const toXml = (entries) => {
  const urls = entries
    .map(
      (entry) => `  <url>\n    <loc>${buildUrl(entry.path)}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

const toRobots = () => `User-agent: *\nAllow: /\n\nSitemap: ${buildUrl("/sitemap.xml")}\n`;

const main = async () => {
  await fs.mkdir(publicDir, { recursive: true });

  const dynamicEntries = await fetchWordPressEntries();
  const now = new Date().toISOString();

  const entries = uniqueByPath([
    ...staticEntries.map((entry) => ({ ...entry, lastmod: now })),
    ...dynamicEntries,
  ]);

  await fs.writeFile(path.join(publicDir, "sitemap.xml"), toXml(entries), "utf8");
  await fs.writeFile(path.join(publicDir, "robots.txt"), toRobots(), "utf8");

  console.log(`[sitemap] Generados sitemap.xml y robots.txt con ${entries.length} URLs.`);
};

main().catch((error) => {
  console.error("[sitemap] Error generando sitemap:", error);
  process.exitCode = 1;
});
