import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import usePages from "../hooks/usePages";
import useSEO from "../hooks/useSEO";
import { getAllPosts, type BlogPostListItem } from "../lib/apiFunctions";
import LoadingSpinner from "../ui/LoadingSpinner";

const staticLinks = [
  { to: "/", label: "Inicio" },
  { to: "/blogs", label: "Blog" },
  { to: "/mapa-del-sitio", label: "Mapa del sitio" },
];

export default function MapaSitio() {
  const { pages, loading: pagesLoading, error: pagesError } = usePages();
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useSEO(undefined, {
    title: "Mapa del sitio",
    description:
      "Explora todas las paginas y publicaciones disponibles en Disorder Underground Shop.",
  });

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      try {
        const data = await getAllPosts(50);
        if (!isMounted) {
          return;
        }
        setPosts(data.filter((post) => Boolean(post.slug)));
      } finally {
        if (isMounted) {
          setPostsLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const orderedPages = useMemo(
    () =>
      pages
        .filter((page) => page.slug && page.slug !== "inicio")
        .slice()
        .sort((a, b) => (a.menuOrder ?? 0) - (b.menuOrder ?? 0)),
    [pages],
  );

  const orderedPosts = useMemo(
    () =>
      posts
        .slice()
        .sort((a, b) => (b.date ? new Date(b.date).getTime() : 0) - (a.date ? new Date(a.date).getTime() : 0)),
    [posts],
  );

  if (pagesLoading && postsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-with-navbar px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500 dark:text-primary-300">
          Navegacion completa
        </p>
        <h1 className="mt-3 text-4xl font-bold text-primary-700 dark:text-primary-100 md:text-5xl">
          Mapa del sitio
        </h1>
        <p className="mt-4 max-w-3xl text-primary-700 dark:text-primary-200">
          Acceso rapido a las paginas principales del estudio, al blog y a las rutas de informacion general del proyecto.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <section className="rounded-2xl border border-primary-300/35 bg-primary-50/70 p-6 dark:border-primary-200/15 dark:bg-primary-950/30">
            <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-100">
              Principal
            </h2>
            <ul className="mt-4 space-y-3 text-primary-700 dark:text-primary-200">
              {staticLinks.map((link) => (
                <li key={link.to}>
                  <Link className="transition-colors hover:text-primary-500 dark:hover:text-primary-100" to={link.to}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-primary-300/35 bg-primary-50/70 p-6 dark:border-primary-200/15 dark:bg-primary-950/30">
            <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-100">
              Paginas
            </h2>
            {pagesError ? (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                No se pudieron cargar las paginas publicadas.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-primary-700 dark:text-primary-200">
                {orderedPages.map((page) => (
                  <li key={page.id}>
                    <Link
                      className="transition-colors hover:text-primary-500 dark:hover:text-primary-100"
                      to={`/${page.slug}`}
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-primary-300/35 bg-primary-50/70 p-6 dark:border-primary-200/15 dark:bg-primary-950/30 md:col-span-2 xl:col-span-1">
            <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-100">
              Blog
            </h2>
            {postsLoading ? (
              <p className="mt-4 text-primary-700 dark:text-primary-200">
                Cargando publicaciones...
              </p>
            ) : orderedPosts.length === 0 ? (
              <p className="mt-4 text-primary-700 dark:text-primary-200">
                No hay articulos publicados todavia.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-primary-700 dark:text-primary-200">
                {orderedPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      className="transition-colors hover:text-primary-500 dark:hover:text-primary-100"
                      to={`/blogs/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
