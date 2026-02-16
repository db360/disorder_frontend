import { useEffect, useMemo, useState } from "react";
import type { GetPageBySlugQuery } from "../api/graphql/generated";
import { getGaleriaBySlug, getPageBySlug } from "../lib/apiFunctions";
import { parseTeamContent } from "../lib/parseTeamContent";
import type { Galeria } from "../types/wordpress";
import LoadingSpinner from "../ui/LoadingSpinner";
import SwipeCarousel from "../ui/Carousel";

export default function Equipo() {
    const [page, setPage] = useState<GetPageBySlugQuery["page"] | null>(null);
    const [galleriesBySlug, setGalleriesBySlug] = useState<Record<string, Galeria>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const equipoPage = await getPageBySlug("nuestro-equipo");
                if (!isMounted) return;
                setPage(equipoPage);

                const artists = parseTeamContent(equipoPage?.content);
                const gallerySlugs = [...new Set(artists.map((artist) => artist.gallerySlug).filter(Boolean))] as string[];

                if (gallerySlugs.length === 0) {
                    return;
                }

                const galleries = await Promise.all(
                    gallerySlugs.map(async (slug) => ({
                        slug,
                        data: await getGaleriaBySlug(slug),
                    })),
                );

                if (!isMounted) return;

                const normalized: Record<string, Galeria> = {};
                galleries.forEach(({ slug, data }) => {
                    if (data) {
                        normalized[slug] = data;
                    }
                });
                setGalleriesBySlug(normalized);
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

    const artists = useMemo(() => parseTeamContent(page?.content), [page?.content]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="page-with-navbar px-6 py-10 space-y-12 mt-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-primary-600 dark:text-white text-center">
                {page?.title ?? "Nuestro equipo"}
            </h1>

            {artists.map((artist) => {
                const gallery = artist.gallerySlug ? galleriesBySlug[artist.gallerySlug] : undefined;
                const images =
                    gallery?.galeriaImagenes?.map((img, index) => ({
                        id: `${gallery.id}-${index}`,
                        src: img.sourceUrl,
                        srcSet: img.mediaDetails?.sizes
                            ?.map((size) => `${size.sourceUrl} ${size.width}w`)
                            .concat(`${img.sourceUrl} ${img.mediaDetails?.width ?? 0}w`)
                            .join(", "),
                        sizes: "(min-width: 1024px) 70vw, 100vw",
                        title: gallery.title || artist.name,
                    })) ?? [];

                return (
                    <section
                        key={artist.name}
                        className="max-w-5xl mx-auto rounded-xl border border-primary-300/30 dark:border-primary-200/20 p-6 sm:p-8"
                    >
                        <h2 className="text-3xl font-bold text-primary-600 dark:text-white">{artist.name}</h2>

                        {artist.description && (
                            <p className="mt-4 whitespace-pre-line text-primary-500 dark:text-primary-100">
                                {artist.description}
                            </p>
                        )}

                        {images.length > 0 && (
                            <div className="mt-6">
                                <SwipeCarousel images={images} />
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}