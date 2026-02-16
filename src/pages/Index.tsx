import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getPageBySlug } from "../lib/apiFunctions";
import type { GetPageBySlugQuery } from "../api/graphql/generated";
import LoadingSpinner from "../ui/LoadingSpinner";
import useSEO from "../hooks/useSEO";
import ScrollText from "../ui/ScrollText";
import SwipeCarousel from "../ui/Carousel";
import { parseWordPressContent } from "../lib/parseWordPressContent";
import Map from "../ui/Map";
import RevealLinks from "../ui/RevealLinks";

export default function Index() {
  const [page, setPage] = useState<GetPageBySlugQuery["page"] | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(false);

  useEffect(() => {
    getPageBySlug("inicio").then((data) => {
      setPage(data);
    });
  }, []);

  useEffect(() => {
    if (!page) {
      document.body.classList.add("page-loading");
    } else {
      document.body.classList.remove("page-loading");
    }
    return () => {
      document.body.classList.remove("page-loading");
    };
  }, [page]);

  useEffect(() => {
    if (!page) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSnapEnabled(true));
    });
    return () => {
      cancelAnimationFrame(id);
      setSnapEnabled(false);
    };
  }, [page]);

  useEffect(() => {
    if (!snapEnabled) return;
    document.body.classList.add("page-snap");
    document.documentElement.classList.add("page-snap");
    return () => {
      document.body.classList.remove("page-snap");
      document.documentElement.classList.remove("page-snap");
    };
  }, [snapEnabled]);

  const sections = useMemo(
    () => [
      { id: "hero", title: page?.title ?? "Inicio", subtitle: "Sección 1" },
      { id: "intro", title: "Sección 2", subtitle: "Texto de apoyo" },
      { id: "gallery", title: "Sección 3", subtitle: "Texto de apoyo" },
      { id: "services", title: "Sección 4", subtitle: "Texto de apoyo" },
      { id: "contact", title: "Sección 5", subtitle: "Texto de apoyo" },
    ],
    [page],
  );

  const parsedContent = useMemo(
    () => parseWordPressContent(page?.content),
    [page?.content],
  );

  const galleryImagesBySelection = useMemo(
    () => {
      const toCarouselImages = (images: typeof parsedContent.images) =>
        images.map((image) => ({
        id: image.id,
        src: image.src,
        srcSet: image.srcSet,
        sizes: image.sizes,
        title: image.alt || page?.title || "Imagen",
      }));

      const first = toCarouselImages(parsedContent.galleries[0]?.images ?? []);
      const second = toCarouselImages(parsedContent.galleries[1]?.images ?? []);
      const bothFromBlocks = toCarouselImages(
        parsedContent.galleries.flatMap((gallery) => gallery.images),
      );
      const both =
        bothFromBlocks.length > 0
          ? bothFromBlocks
          : toCarouselImages(parsedContent.images);

      return {
        first,
        second,
        both,
      };
    },
    [parsedContent, page?.title],
  );

  useSEO(page?.seo, {
    title: page?.title ?? "Inicio",
    description:
      page?.seo?.metaDesc ??
      "Bienvenido a Disorder Underground Shop, tatuajes, ropa y accesorios en un solo lugar. Descubre nuestro catálogo y reserva tu cita hoy.",
  });

  if (!page) return <LoadingSpinner />;

  return (
    <div className="home-sections">
      {sections.map((section, index) => {
        const isHero = section.id === "hero";

        return (
          <motion.section
            key={section.id}
            className={`home-section flex justify-center ${isHero ? "items-end" : "items-center"}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ amount: 0.6 }}
          >
            {section.id !== "hero" &&
              section.id !== "gallery" &&
              section.id !== "intro" && (
                <div className="text-center max-w-2xl">
                  <p className="text-sm uppercase tracking-widest text-primary-300 dark:text-primary-200">
                    {section.subtitle}
                  </p>
                  <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-bold text-primary-600 dark:text-white">
                    {section.title}
                  </h1>
                  <p className="mt-4 text-base sm:text-lg text-primary-500 dark:text-primary-100">
                    Contenedor {index + 1} de 5. Ajusta este contenido según tu
                    diseño.
                  </p>
                </div>
              )}

            {section.id === "hero" && (
              <div className="w-full h-full">
                <ScrollText
                  text="Disorder Underground Shop"
                  textSize={123}
                  textY={50}
                  containerClassName="h-100"
                />
                <div className="max-w-3xl mx-auto space-y-4 px-6 text-center">
                  {parsedContent.paragraphs.map((paragraph, paragraphIndex) => (
                    <p
                      key={`${section.id}-paragraph-${paragraphIndex}`}
                      className="text-2xl text-primary-500 dark:text-primary-100"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {section.id === "gallery" && (
              <>
                <div className="w-2/3 flex flex-col items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-primary-600 dark:text-white mb-2 text-center">
                      Nos encontramos en:{" "}
                      <span>Plaza de la Libertad 3 Local 7B</span>
                    </h2>
                    <h3 className="text-2xl font-semibold text-primary-500 dark:text-primary-100 text-center mb-10">
                      San Pedro Alcántara
                    </h3>
                  </div>
                  <div className="w-200 mb-10">
                    <SwipeCarousel images={galleryImagesBySelection.first} dots={false} />
                  </div>

                  <Map height={300} />
                </div>
                <RevealLinks />
              </>
            )}

            {section.id === "intro" && <div className="w-2/3">
              <SwipeCarousel images={galleryImagesBySelection.second} dots={false} />
            </div>}
          </motion.section>
        );
      })}
    </div>
  );
}
