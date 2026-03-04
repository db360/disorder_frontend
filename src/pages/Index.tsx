import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getPageBySlug } from "../lib/apiFunctions";
import type { GetPageBySlugQuery } from "../api/graphql/generated";
import LoadingSpinner from "../ui/LoadingSpinner";
import useSEO from "../hooks/useSEO";
import ScrollText from "../ui/ScrollText";
import SwipeCarousel from "../ui/Carousel";
import ImageTrail from "../ui/ImageTrail";
import { parseWordPressContent } from "../lib/parseWordPressContent";
import Map from "../ui/Map";
import RevealLinks from "../ui/RevealLinks";
import FallingText from "../ui/FallingText";
import StillBurningAnimatedHero from "../ui/StillBurningAnimatedHero";
import Carousel from "../ui/Carousel";

export default function Index() {

  // Añadir scroll snap al montar y quitar al desmontar
  useEffect(() => {
    document.documentElement.classList.add("page-snap");
    return () => {
      document.documentElement.classList.remove("page-snap");
    };
  }, []);

  const [page, setPage] = useState<GetPageBySlugQuery["page"] | null>(null);
  const [stillBurningPage, setStillBurningPage] = useState<
    GetPageBySlugQuery["page"] | null
  >(null);


  useEffect(() => {
    let isMounted = true;

    getPageBySlug("inicio").then((data) => {
      if (!isMounted) return;
      setPage(data);
    });

    getPageBySlug("still-burning").then((data) => {
      if (!isMounted) return;
      setStillBurningPage(data);
    });

    return () => {
      isMounted = false;
    };
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

  const sections = useMemo(
    () => [
      { id: "hero", title: page?.title ?? "Inicio", subtitle: "Sección 1" },
      { id: "intro", title: "Sección 2", subtitle: "Texto de apoyo" },
      {
        id: "estudio",
        title: "Resumen Estudio",
        subtitle: "Pequeño resumen del estudio y fotos",
      },
      { id: "services", title: "Servicios", subtitle: "Diferentes Servicios" },
      { id: "stillburning", title: "Still Burning", subtitle: "Colección" },
      { id: "contact", title: "Sección 5", subtitle: "Texto de apoyo" },
    ],
    [page],
  );

  const parsedContent = useMemo(
    () => parseWordPressContent(page?.content),
    [page?.content],
  );

  const galleryImagesBySelection = useMemo(() => {
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
  }, [parsedContent, page?.title]);

  const stillBurningHeroImages = useMemo(() => {
    const stillBurningParsedContent = parseWordPressContent(
      stillBurningPage?.content,
    );
    const galleryImages = stillBurningParsedContent.galleries
      .flatMap((gallery) => gallery.images)
      .filter((image) => Boolean(image.src));

    if (galleryImages.length > 0) {
      return galleryImages;
    }

    return stillBurningParsedContent.images.filter((image) =>
      Boolean(image.src),
    );
  }, [stillBurningPage?.content]);

  useSEO(page?.seo, {
    title: page?.title ?? "Inicio",
    description:
      page?.seo?.metaDesc ??
      "Bienvenido a Disorder Underground Shop, tatuajes, ropa y accesorios en un solo lugar. Descubre nuestro catálogo y reserva tu cita hoy.",
  });

  if (!page) return <LoadingSpinner />;

  return (
    <div className="home-sections">
      {sections.map((section) => {
        const isHero = section.id === "hero";

        return (
          <motion.section
            key={section.id}
            id={section.id}
            className={`home-section flex justify-center ${isHero ? "items-end" : "items-center"}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ amount: 0.6 }}
          >


            {section.id === "hero" && (
              <div className="w-full h-full">
                <ScrollText
                  text="Disorder Underground Shop"
                  textSize={123}
                  textY={50}
                  containerClassName="h-100"
                />
                <div className="max-w-3xl mx-auto space-y-6 px-8 text-center border-primary-100/50 border-2 rounded-lg py-6 bg-linear-to-br from-primary-100 via-primary-200 to-primary-300 dark:from-primary-700 dark:via-primary-600 dark:to-primary-500 shadow-2xl">
                  {parsedContent.paragraphs.map((paragraph, paragraphIndex) => (
                    <FallingText
                      key={`${section.id}-paragraph-${paragraphIndex}-falling`}
                      text={paragraph}
                      highlightWords={[
                        "tatuajes",
                        "superguapa",
                        "verdad",
                        "buena",
                        "duros",
                      ]}
                      highlightClass="highlighted"
                      trigger="button"
                      backgroundColor="transparent"
                      wireframes={false}
                      gravity={1.27}
                      fontSize="2rem"
                      mouseConstraintStiffness={1.2}
                    />
                  ))}
                </div>
              </div>
            )}

            {section.id === "intro" && (
              <div className="relative min-h-[500px] md:min-h-[500px] flex items-center justify-center w-full">
                <img
                  src="/img/espiral.svg"
                  alt="Espiral decorativa"
                  aria-hidden="true"
                  className="absolute inset-0 m-auto w-[min(80vw,700px)] max-w-full max-h-full opacity-70 pointer-events-none select-none z-0 animate-[spin_3s_infinite_linear]"
                />
                <div className="relative z-10 w-full h-full">
                  <ImageTrail
                    items={galleryImagesBySelection.both.map(
                      (image) => image.src,
                    )}
                    variant={1}
                    centerText="TATÚATE CON NOSOTROS"
                  />
                </div>
              </div>
            )}

            {section.id === "stillburning" && (
              <StillBurningAnimatedHero
                title="Still Burning"
                images={stillBurningHeroImages}
                className="h-full"
                ctaLabel="DESCUBRIR STILL BURNING"
                ctaHref="/still-burning"
              />
            )}

            {section.id === "services" && (
              <div className="w-full max-w-6xl px-6">
                <div className="mb-8 text-center">
                  <p className="text-sm uppercase tracking-widest text-primary-300 dark:text-primary-200">
                    {section.subtitle}
                  </p>
                  <h2 className="mt-2 text-4xl font-bold text-primary-700 dark:text-primary-100 md:text-5xl">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-primary-600 dark:text-primary-200">
                    Diseños personalizados, sesiones seguras y acabados premium
                    para cada estilo.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  {[
                    {
                      name: "Tatuaje Fine Line",
                      duration: "1h - 3h",
                      from: "Desde 90€",
                      detail:
                        "Líneas finas, lettering y microdiseños con alto detalle.",
                    },
                    {
                      name: "Blackwork & Sombras",
                      duration: "2h - 6h",
                      from: "Desde 160€",
                      detail:
                        "Contrastes profundos, rellenos sólidos y degradados profesionales.",
                    },
                    {
                      name: "Color Realista",
                      duration: "3h - 8h",
                      from: "Desde 220€",
                      detail:
                        "Trabajo por capas para lograr volumen, textura y color duradero.",
                    },
                  ].map((service) => (
                    <article
                      key={service.name}
                      className="rounded-xl border border-primary-300/40 bg-primary-100/60 p-5 shadow-lg dark:border-primary-200/20 dark:bg-primary-900/55"
                    >
                      <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-100">
                        {service.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-primary-600 dark:text-primary-300">
                        {service.from} · {service.duration}
                      </p>
                      <img
                        src="/img/placeholder.png"
                        alt={`Imagen de ${service.name}`}
                        className="mt-3 h-44 w-full rounded-lg object-cover"
                      />
                      <p className="mt-3 text-primary-700 dark:text-primary-200">
                        {service.detail}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="mt-7 grid grid-cols-3 gap-4 rounded-xl border border-primary-300/35 bg-primary-200/55 p-4 text-center dark:border-primary-200/20 dark:bg-primary-800/45">
                  <div>
                    <p className="text-3xl font-black text-primary-700 dark:text-primary-100">
                      +1.200
                    </p>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                      Tatuajes realizados
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-primary-700 dark:text-primary-100">
                      98%
                    </p>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                      Clientes recurrentes
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-primary-700 dark:text-primary-100">
                      4.9/5
                    </p>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                      Valoración media
                    </p>
                  </div>
                </div>
              </div>
            )}

            {section.id === "estudio" && (
              <div className="w-full max-w-6xl px-6">
                <Carousel images={galleryImagesBySelection.first} />
              </div>
            )}

            {section.id === "contact" && (
              <>
                <div className="w-2/3 flex flex-col items-center">
                  <div className="relative w-200 mb-10 overflow-hidden rounded-xl border border-primary-200/25 bg-primary-900/45">
                    <div className="pointer-events-none absolute inset-0 z-10 bg-primary-900/30" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-15 h-42 bg-linear-to-b from-primary-900/90 via-primary-900/75 to-transparent" />

                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-6 text-center">
                      <h2 className="mb-2 text-3xl font-bold text-primary-100">
                        Nos encontramos en:{" "}
                        <span>Plaza de la Libertad 3 Local 7B</span>
                      </h2>
                      <h3 className="text-2xl font-semibold text-primary-200">
                        San Pedro Alcántara
                      </h3>
                    </div>

                    <div className="relative z-0">
                      <SwipeCarousel
                        images={galleryImagesBySelection.first}
                        dots={false}
                      />
                    </div>
                  </div>

                  <Map height={300} />
                </div>
                <RevealLinks />
              </>
            )}
          </motion.section>
        );
      })}
    </div>
  );
}
