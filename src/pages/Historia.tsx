import { useEffect, useMemo, useState } from "react";
import type { GetPageBySlugQuery } from "../api/graphql/generated";
import { getPageBySlug } from "../lib/apiFunctions";
import { parseWordPressContent } from "../lib/parseWordPressContent";
import LoadingSpinner from "../ui/LoadingSpinner";
import useSEO from "../hooks/useSEO";
import ImageGallery from "../ui/ImageGallery";
import ScrollVelocity from "../ui/ScrollVelocity";

export default function Historia() {
  const [page, setPage] = useState<GetPageBySlugQuery["page"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const historiaPage = await getPageBySlug("estudio");
        if (!isMounted) return;
        setPage(historiaPage);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const wpContent = useMemo(
    () => parseWordPressContent(page?.content),
    [page?.content],
  );
  const galleryImages = useMemo(() => {
    const galleryImgs = wpContent.galleries
      .flatMap((gallery) => gallery.images)
      .filter((image) => Boolean(image.src));
    if (galleryImgs.length > 0) {
      return galleryImgs;
    }
    return wpContent.images.filter((image) => Boolean(image.src));
  }, [wpContent.galleries, wpContent.images]);

  const imageGalleryItems = useMemo(
    () =>
      galleryImages.map((image, index) => ({
        id: image.id || `historia-image-${index}`,
        src: image.src,
        srcSet: image.srcSet,
        sizes: image.sizes,
        title: image.alt || `Historia ${index + 1}`,
        description: "",
      })),
    [galleryImages],
  );

  useSEO(page?.seo, {
    title: page?.title ?? "El Estudio",
    description:
      page?.seo?.metaDesc ??
      "Descubre la historia de Disorder Underground Shop.",
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-with-navbar">
      <section className="page-full-minus-navbar relative flex items-center px-6">
        <div
          className="absolute inset-0 z-0 bg-[url('/img/trazos-fondo.svg')] bg-center bg-cover bg-no-repeat opacity-30 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-6xl mx-auto w-full space-y-6">
          <ScrollVelocity
            texts={[page?.title || "El Estudio", "Disorder Underground Shop"]}
            velocity={100}
            className="custom-scroll-text py-4"
          />
          <h1 className="sr-only">{page?.title ?? "El Estudio"}</h1>
          <div className="space-y-6">
            {wpContent.paragraphs.length > 0 ? (
              wpContent.paragraphs.map((paragraph, index) => (
                <p
                  key={`paragraph-${index}`}
                  className="text-lg text-primary-700 dark:text-primary-200 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-center text-primary-500 dark:text-primary-300">
                No hay contenido disponible para mostrar.
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="page-full-minus-navbar">
        {imageGalleryItems.length > 0 ? (
          <ImageGallery images={imageGalleryItems} />
        ) : (
          <div className="page-full-minus-navbar flex items-center justify-center px-6 text-center">
            <p className="text-primary-500 dark:text-primary-300">
              No hay imágenes disponibles en la galería Historia.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
