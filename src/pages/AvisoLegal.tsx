import { useEffect, useState } from "react";
import type { GetPageBySlugQuery } from "../api/graphql/generated";
import useSEO from "../hooks/useSEO";
import { getPageBySlug } from "../lib/apiFunctions";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function AvisoLegal() {
  const [page, setPage] = useState<GetPageBySlugQuery["page"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      try {
        const data = await getPageBySlug("aviso-legal");
        if (!isMounted) return;
        setPage(data);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      isMounted = false;
    };
  }, []);

  useSEO(page?.seo, {
    title: page?.title ?? "Aviso legal",
    description:
      page?.seo?.metaDesc ?? "Aviso legal de Disorder Underground Shop.",
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-with-navbar px-6 py-10">
      <article className="mx-auto max-w-4xl">
        {page?.content ? (
          <div
            className="wp-content mt-8"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <p className="mt-6 text-primary-600 dark:text-primary-300">
            No hay contenido disponible para esta pagina.
          </p>
        )}
      </article>
    </div>
  );
}
