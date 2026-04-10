import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllPosts, type BlogPostListItem } from "../lib/apiFunctions";
import LoadingSpinner from "../ui/LoadingSpinner";
import useSEO from "../hooks/useSEO";

const formatDate = (date?: string | null): string => {
  if (!date) return "";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return parsedDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function Blog() {
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSEO(undefined, {
    title: "Blog",
    description: "Últimos artículos y novedades de Disorder Underground Shop.",
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await getAllPosts(30);
        if (!isMounted) return;
        setPosts(data.filter((post) => Boolean(post.slug)));
      } catch {
        if (!isMounted) return;
        setError("No se pudieron cargar los posts.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const orderedPosts = useMemo(
    () =>
      [...posts].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }),
    [posts],
  );

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="page-with-navbar px-6 py-10 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="px-6 py-32 relative">
      <div
        className="fixed inset-0 z-0 bg-[url('/img/trazos-fondo-900x400.webp')] md:bg-[url('/img/trazos-fondo.webp')] bg-center bg-cover bg-no-repeat opacity-20 pointer-events-none brightness-50 dark:brightness-100"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-6xl relative z-10">
        <h1 className="mb-8 text-4xl font-bold text-primary-700 dark:text-primary-100 font-beatstreet">
          Blogs
        </h1>

        {orderedPosts.length === 0 ? (
          <p className="text-primary-600 dark:text-primary-300">
            Aún no hay publicaciones disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orderedPosts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-xl border border-primary-300/40 bg-primary-100/60 shadow-lg dark:border-primary-200/20 dark:bg-primary-900/55"
              >
                {post.featuredImage?.sourceUrl ? (
                  <img
                    src={post.featuredImage.sourceUrl}
                    srcSet={post.featuredImage.srcSet}
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    alt={post.featuredImage.altText ?? post.title}
                    className="h-52 w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}

                <div className="space-y-3 p-5">
                  {post.date ? (
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                      {formatDate(post.date)}
                    </p>
                  ) : null}

                  <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-100">
                    {post.title}
                  </h2>

                  {post.excerpt ? (
                    <div
                      className="line-clamp-4 text-primary-700 dark:text-primary-200"
                      dangerouslySetInnerHTML={{ __html: post.excerpt }}
                    />
                  ) : null}

                  <Link
                    to={`/blogs/${post.slug}`}
                    className="inline-block font-semibold text-primary-700 transition-colors hover:text-primary-500 dark:text-primary-200 dark:hover:text-primary-100"
                  >
                    Leer artículo
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
