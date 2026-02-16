import { useEffect, useMemo, useState } from "react";
import { getAllGalerias } from "../lib/apiFunctions";
import ImageGallery from "../ui/ImageGallery";
import LoadingSpinner from "../ui/LoadingSpinner";
import type { Galeria } from "../types/wordpress";

export default function Gallery() {
  const [galleries, setGalleries] = useState<Galeria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await getAllGalerias();
        if (!isMounted) return;
        setGalleries(data);
      } catch {
        if (!isMounted) return;
        setError("No se pudieron cargar las galerías.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const images = useMemo(
    () =>
      galleries
        .filter((galeria) => galeria.galeriaMostrarEnFrontend === true)
        .flatMap((galeria) =>
          (galeria.galeriaImagenes ?? []).map((img, index) => ({
            id: `${galeria.id}-${index}`,
            src: img.sourceUrl,
            srcSet: img.mediaDetails?.sizes
              ?.map((size) => `${size.sourceUrl} ${size.width}w`)
              .concat(`${img.sourceUrl} ${img.mediaDetails?.width ?? 0}w`)
              .join(", "),
            sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
            title: galeria.title,
            description: galeria.seo?.metaDesc ?? img.altText ?? "",
          }))
        ),
    [galleries]
  );


  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="page-with-navbar px-6 py-10 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="page-with-navbar px-6 py-10 text-center text-primary-200">
        No hay imágenes en las galerías.
      </div>
    );
  }

  return (
    <div className="page-with-navbar">
      <ImageGallery images={images} />
    </div>
  );
}
