import { useEffect, useMemo, useState } from "react";
import type { GetPageBySlugQuery } from "../api/graphql/generated";
import { getPageBySlug } from "../lib/apiFunctions";
import { parseWordPressContent } from "../lib/parseWordPressContent";
import LoadingSpinner from "../ui/LoadingSpinner";
import useSEO from "../hooks/useSEO";
import FlameAnimation from "../ui/FlameAnimation";
import ImageGallery from "../ui/ImageGallery";
import StillBurningAnimatedHero from "../ui/StillBurningAnimatedHero";


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
    const galleryBackgroundImages = useMemo(() => {
        const galleryImages = wpContent.galleries
            .flatMap((gallery) => gallery.images)
            .filter((image) => Boolean(image.src));

        if (galleryImages.length > 0) {
            return galleryImages;
        }

        return wpContent.images.filter((image) => Boolean(image.src));
    }, [wpContent.galleries, wpContent.images]);

    const imageGalleryItems = useMemo(
        () => galleryBackgroundImages.map((image, index) => ({
            id: image.id || `still-burning-image-${index}`,
            src: image.src,
            srcSet: image.srcSet,
            sizes: image.sizes,
            title: image.alt || `Still Burning ${index + 1}`,
            description: "",
        })),
        [galleryBackgroundImages],
    );

    useSEO(page?.seo, {
        title: page?.title ?? "Still Burning",
        description: page?.seo?.metaDesc ?? "Descubre Still Burning en Disorder Underground Shop.",
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="page-with-navbar relative">
            <div
                className="fixed inset-0 z-0 bg-[url('/img/trazos-fondo-900x400.webp')] md:bg-[url('/img/trazos-fondo.webp')] bg-center bg-cover bg-no-repeat opacity-20 pointer-events-none brightness-50 dark:brightness-100"
                aria-hidden="true"
            />
            <section className="page-full-minus-navbar">
                <StillBurningAnimatedHero
                    title={page?.title ?? "Still Burning"}
                    images={galleryBackgroundImages}
                    className="page-full-minus-navbar"
                />
            </section>


            <section className="page-full-minus-navbar flex items-center px-6 py-10">
                <div className="max-w-6xl mx-auto w-full space-y-6">
                    <div className="flex justify-center">
                        <img
                            src="/img/still-burning-rosa.svg"
                            alt="Still Burning"
                            className="w-full max-w-55"
                        />
                    </div>

                    <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-[minmax(0,0.22fr)_minmax(0,1fr)_minmax(0,0.22fr)]">
                        {galleryBackgroundImages[0]?.src ? (
                            <div className="hidden overflow-hidden rounded-xl md:block">
                                <img
                                    src={galleryBackgroundImages[0].src}
                                    srcSet={galleryBackgroundImages[0].srcSet}
                                    sizes={galleryBackgroundImages[0].sizes || "(min-width: 1024px) 20vw, 100vw"}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="hidden md:block" />
                        )}

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

                            <div className="pt-4 text-center">
                                <a
                                    href="#"
                                    className=" inline-flex items-center justify-center rounded-lg border border-primary-400 bg-primary-600 px-4 py-2 text-sm tracking-wide transition-colors hover:bg-primary-500 dark:border-primary-300 dark:bg-primary-200  dark:hover:bg-primary-400 text-primary-700"
                                >
                                    TIENDA EN CONSTRUCCIÓN<FlameAnimation
                                spriteSheetUrl="/img/animacion-burni.png"
                                className="w-14 h-14 inline-block"
                                frameOffsetY={0}/>
                                </a>

                            </div>
                        </div>

                        {galleryBackgroundImages[1]?.src ? (
                            <div className="hidden overflow-hidden rounded-xl md:block">
                                <img
                                    src={galleryBackgroundImages[1].src}
                                    srcSet={galleryBackgroundImages[1].srcSet}
                                    sizes={galleryBackgroundImages[1].sizes || "(min-width: 1024px) 20vw, 100vw"}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="hidden md:block" />
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
                            No hay imágenes disponibles en la galería Still Burning.
                        </p>
                    </div>
                )}
            </section>

        </div>
    );
}