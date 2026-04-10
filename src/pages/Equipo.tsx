import { useEffect, useMemo, useState } from "react";
import type { GetPageBySlugQuery } from "../api/graphql/generated";
import { getGaleriaBySlug, getPageBySlug } from "../lib/apiFunctions";
import { parseTeamContent } from "../lib/parseTeamContent";
import type { Galeria } from "../types/wordpress";
import LoadingSpinner from "../ui/LoadingSpinner";
import SwipeCarousel from "../ui/Carousel";
import useSEO from "../hooks/useSEO";
import { normalizeWordPressUrl } from "../lib/normalizeWordPressUrl";

export default function Equipo() {
    const [page, setPage] = useState<GetPageBySlugQuery["page"] | null>(null);
    const [galleriesBySlug, setGalleriesBySlug] = useState<Record<string, Galeria>>({});
    const [loadingPage, setLoadingPage] = useState(true);
    const [loadingGalleries, setLoadingGalleries] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadPage = async () => {
            try {
                const equipoPage = await getPageBySlug("nuestro-equipo");
                if (!isMounted) return;
                setPage(equipoPage);
            } finally {
                if (isMounted) {
                    setLoadingPage(false);
                }
            }
        };

        loadPage();

        return () => {
            isMounted = false;
        };
    }, []);

    const artists = useMemo(() => parseTeamContent(page?.content), [page?.content]);
    const gallerySlugs = useMemo(
        () => [...new Set(artists.map((artist) => artist.gallerySlug).filter(Boolean))] as string[],
        [artists],
    );

    useEffect(() => {
        let isMounted = true;

        const loadGalleries = async () => {
            if (gallerySlugs.length === 0) {
                if (isMounted) {
                    setGalleriesBySlug({});
                    setLoadingGalleries(false);
                }
                return;
            }

            if (isMounted) {
                setLoadingGalleries(true);
            }

            try {
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
                    setLoadingGalleries(false);
                }
            }
        };

        loadGalleries();

        return () => {
            isMounted = false;
        };
    }, [gallerySlugs]);

    useSEO(page?.seo, {
        title: page?.title ?? "Nuestro equipo",
        description:
            page?.seo?.metaDesc ??
            "Conoce a los artistas de Disorder Underground Shop y su estilo de trabajo.",
    });

    if (loadingPage || loadingGalleries) return <LoadingSpinner />;

    return (
        <div className="page-with-navbar px-6 py-10 space-y-12 mt-10 relative">
            <div
                className="fixed inset-0 z-0 bg-[url('/img/trazos-fondo-900x400.webp')] md:bg-[url('/img/trazos-fondo.webp')] bg-center bg-cover bg-no-repeat opacity-20 pointer-events-none brightness-50 dark:brightness-100"
                aria-hidden="true"
            />
            <h1 className="text-4xl sm:text-5xl font-bold text-primary-900 dark:text-white text-center">
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
                        className="max-w-5xl mx-auto rounded-xl border border-primary-300/30 dark:border-primary-200/20 bg-primary-700/25 p-6 sm:p-8"
                    >
                        <h2 className="text-3xl font-bold text-primary-200 dark:text-white">{artist.name}</h2>

                        {artist.leadTitleHtml && (
                            <div
                                className="mt-4 text-2xl font-bold leading-tight text-primary-100 dark:text-primary-400 sm:text-3xl"
                                dangerouslySetInnerHTML={{ __html: artist.leadTitleHtml }}
                            />
                        )}

                        {artist.leadImage && (
                            <div className="mt-6 overflow-hidden rounded-2xl border border-primary-300/30 dark:border-primary-200/20">
                                <img
                                    src={normalizeWordPressUrl(artist.leadImage.src)}
                                    srcSet={artist.leadImage.srcSet}
                                    sizes={artist.leadImage.sizes ?? "(min-width: 768px) 50vw, 100vw"}
                                    alt={artist.leadImage.alt || artist.name}
                                    className="w-2/3 h-80 mx-auto object-contain"
                                    loading="lazy"
                                />
                            </div>
                        )}

                        {artist.descriptionHtml && (
                            <div
                                className="wp-content mt-6 text-primary-100 dark:text-primary-100 **:text-primary-900 dark:**:text-primary-100"
                                dangerouslySetInnerHTML={{ __html: artist.descriptionHtml }}
                            />
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