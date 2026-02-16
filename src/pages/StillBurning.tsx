import { useEffect, useMemo, useState } from "react";
import type { GetPageBySlugQuery } from "../api/graphql/generated";
import { getPageBySlug } from "../lib/apiFunctions";
import { parseWordPressContent } from "../lib/parseWordPressContent";
import LoadingSpinner from "../ui/LoadingSpinner";
import SwipeCarousel from "../ui/Carousel";
import useSEO from "../hooks/useSEO";

export default function StillBurning() {
    const [page, setPage] = useState<GetPageBySlugQuery["page"] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const stillBurningPage = await getPageBySlug("still-burning");
                if (!isMounted) return;
                setPage(stillBurningPage);
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

    const wpContent = useMemo(() => parseWordPressContent(page?.content), [page?.content]);

    useSEO(page?.seo, {
        title: page?.title ?? "Still Burning",
        description: page?.seo?.metaDesc ?? "Descubre Still Burning en Disorder Underground Shop.",
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="page-with-navbar px-6 py-10 space-y-16 mt-10">
            <div className="max-w-5xl mx-auto text-center space-y-4">
                <h1 className="text-4xl sm:text-6xl font-bold text-primary-600 dark:text-white">
                    {page?.title ?? "Still Burning"}
                </h1>
            </div>

            <div className="max-w-6xl mx-auto space-y-12">
                {/* Mostrar todos los párrafos */}
                {wpContent.paragraphs.length > 0 && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        {wpContent.paragraphs.map((paragraph, index) => (
                            <p
                                key={`paragraph-${index}`}
                                className="text-lg text-primary-700 dark:text-primary-200 leading-relaxed"
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                )}

                {/* Mostrar todas las galerías */}
                {wpContent.galleries.length > 0 && (
                    <div className="space-y-16 mt-12">
                        {wpContent.galleries.map((gallery, galleryIndex) => {
                            const images = gallery.images.map((img, imgIndex) => ({
                                id: img.id || `gallery-${galleryIndex}-${imgIndex}`,
                                src: img.src,
                                srcSet: img.srcSet,
                                sizes: img.sizes || "(min-width: 1024px) 70vw, 90vw",
                                title: img.alt || `Imagen ${imgIndex + 1}`,
                            }));

                            return (
                                <div
                                    key={`gallery-${gallery.id}`}
                                    className="max-w-5xl mx-auto rounded-xl overflow-hidden shadow-lg border border-primary-300/30 dark:border-primary-200/20 p-2"
                                >
                                    <SwipeCarousel images={images} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Mensaje si no hay contenido */}
                {wpContent.paragraphs.length === 0 && wpContent.galleries.length === 0 && (
                    <div className="max-w-4xl mx-auto text-center py-12">
                        <p className="text-primary-500 dark:text-primary-300">
                            No hay contenido disponible para mostrar.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}