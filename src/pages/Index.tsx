import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getPageBySlug } from "../lib/apiFunctions";
import type { GetPageBySlugQuery } from "../api/graphql/generated";
import LoadingSpinner from "../ui/LoadingSpinner";
import useSEO from "../hooks/useSEO";
import { parseWordPressContent } from "../lib/parseWordPressContent";
import type { CarouselImage } from "../ui/Carousel";

const DisorderLogo = lazy(() => import("../ui/DisorderLogo"));
const Map = lazy(() => import("../ui/Map"));
const ImageTrail = lazy(() => import("../ui/ImageTrail"));
const StillBurningAnimatedHero = lazy(
  () => import("../ui/StillBurningAnimatedHero"),
);
const Carousel = lazy(() => import("../ui/Carousel"));
const SwipeCarousel = lazy(() => import("../ui/Carousel"));
const RevealLinks = lazy(() => import("../ui/RevealLinks"));
const ScrollToTop = lazy(() => import("../ui/ScrollToTop"));

export default function Index() {
  // Activar scroll snap solo en desktop para evitar problemas en móvil
  useEffect(() => {
    const desktopMediaQuery = window.matchMedia("(min-width: 1024px)");

    const updateSnapState = () => {
      const isDesktop = desktopMediaQuery.matches;
      document.documentElement.classList.toggle("page-snap", isDesktop);
      document.body.classList.toggle("page-snap", isDesktop);
    };

    updateSnapState();

    const handleChange = () => {
      updateSnapState();
    };

    if (typeof desktopMediaQuery.addEventListener === "function") {
      desktopMediaQuery.addEventListener("change", handleChange);
    } else {
      desktopMediaQuery.addListener(handleChange);
    }

    return () => {
      document.documentElement.classList.remove("page-snap");
      document.body.classList.remove("page-snap");
      if (typeof desktopMediaQuery.removeEventListener === "function") {
        desktopMediaQuery.removeEventListener("change", handleChange);
      } else {
        desktopMediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const [page, setPage] = useState<GetPageBySlugQuery["page"] | null>(null);
  const [stillBurningPage, setStillBurningPage] = useState<
    GetPageBySlugQuery["page"] | null
  >(null);
  const [activeTechniqueIndex, setActiveTechniqueIndex] = useState(0);

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

  const serviceGroups = [
    {
      eyebrow: "Tatuaje",
      title: "Técnicas que trabajamos en el estudio",
      description:
        "Cada pieza se plantea desde el diseño, la zona del cuerpo y la intención visual para elegir la técnica adecuada.",
      items: ["Tradicional", "Blackwork", "Realismo", "Fine Line", "Cover-ups"],
      accent: "from-primary-300/35 via-primary-200/20 to-transparent",
    },
    {
      eyebrow: "Textil y visual",
      title: "Producción gráfica más allá del tatuaje",
      description:
        "También desarrollamos proyectos para marcas, colectivos y clientes que necesitan llevar su identidad a prendas, carteles o piezas ilustradas.",
      items: [
        "Serigrafía en camisetas y prendas",
        "Diseño gráfico aplicado a merch y comunicación",
        "Ilustración para proyectos editoriales, visuales o de marca",
      ],
      accent:
        "from-(--color-disorder-yellow)/30 via-primary-200/15 to-transparent",
    },
  ];

  // const servicePillars = [
  //   "Diseño personalizado antes de cada trabajo",
  //   "Acompañamiento creativo desde la idea hasta la entrega",
  //   "Producción pensada para piezas únicas y series cortas",
  // ];

  const tattooTechniques = useMemo(() => {
    const fallbackImage: CarouselImage = {
      id: "tattoo-technique-fallback",
      src: "/img/placeholder.png",
      title: "Tatuaje Disorder",
    };
    const sourceImages =
      galleryImagesBySelection.both.length > 0
        ? galleryImagesBySelection.both
        : [fallbackImage];

    return [
      {
        id: "tradicional",
        name: "Tradicional",
        description:
          "Piezas sólidas, composición directa y una lectura potente desde la primera mirada.",
        image: sourceImages[0 % sourceImages.length],
      },
      {
        id: "blackwork",
        name: "Blackwork",
        description:
          "Negro intenso, contraste marcado y diseños con peso visual limpio y contundente.",
        image: sourceImages[1 % sourceImages.length],
      },
      {
        id: "realismo",
        name: "Realismo",
        description:
          "Volumen, textura y profundidad para piezas que necesitan detalle y presencia.",
        image: sourceImages[2 % sourceImages.length],
      },
      {
        id: "fine-line",
        name: "Fine Line",
        description:
          "Línea fina y precisión para composiciones delicadas, limpias y muy controladas.",
        image: sourceImages[3 % sourceImages.length],
      },
      {
        id: "cover-ups",
        name: "Cover-ups",
        description:
          "Rediseñamos piezas anteriores para darles una nueva dirección con criterio técnico y visual.",
        image: sourceImages[4 % sourceImages.length],
      },
    ];
  }, [galleryImagesBySelection.both]);

  const safeActiveTechniqueIndex = Math.min(
    activeTechniqueIndex,
    Math.max(tattooTechniques.length - 1, 0),
  );
  const activeTechnique =
    tattooTechniques[safeActiveTechniqueIndex] ?? tattooTechniques[0];

  useSEO(page?.seo, {
    title: page?.title ?? "Inicio",
    description:
      page?.seo?.metaDesc ??
      "Bienvenido a Disorder Underground Shop, tatuajes, ropa y accesorios en un solo lugar. Reserva tu cita hoy.",
  });

  if (!page) return <LoadingSpinner />;

  return (
    <>
      <div className="home-sections">
      {sections.map((section) => {
        const isHero = section.id === "hero";
        const isContact = section.id === "contact";

        return (
          <motion.section
            key={section.id}
            id={section.id}
            className={`home-section flex justify-center ${isHero ? "items-end overflow-hidden relative" : "items-center"} ${isContact ? "relative bg-[url('/img/fondo-llamas-contacto.webp')] bg-cover bg-center bg-no-repeat" : ""}`}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
          >
            {section.id === "hero" && (
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0 z-0 bg-[url('/img/trazos-fondo.svg')] bg-center bg-cover bg-no-repeat opacity-30"
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  <div className="mx-auto mt-62 xl:mt-35 h-[min(52.5vw,472px)] w-[min(40vw,360px)]">
                    <Suspense fallback={<div className="h-full w-full" />}>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full w-full"
                      >
                        <DisorderLogo className="h-full w-full" />
                      </motion.div>
                    </Suspense>
                  </div>
                  <motion.img
                    src="/img/servicios-titulo.webp"
                    alt="Tatuaje destacado"
                    width={820}
                    height={1024}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
                    className="mx-auto mt-10 xl:mt-5 w-1/2 h-auto rounded-lg object-contain"
                  />
                </div>

              </div>
            )}

            {section.id === "intro" && (
              <div className="relative self-stretch flex items-center justify-center w-full overflow-hidden">
                <img
                  src="/img/espiral.svg"
                  alt="Espiral decorativa"
                  aria-hidden="true"
                  className="absolute inset-0 m-auto w-[min(80vw,700px)] max-w-full max-h-full opacity-70 pointer-events-none select-none z-0 animate-[spin_3s_infinite_linear]"
                />
                <div className="relative z-10 w-full h-full">
                  <Suspense fallback={<div className="h-full w-full" />}>
                    <ImageTrail
                      items={galleryImagesBySelection.both.map(
                        (image) => image.src,
                      )}
                      variant={1}
                      centerText="TATÚATE CON NOSOTROS"
                    />
                  </Suspense>
                </div>
              </div>
            )}

            {section.id === "stillburning" && (
              <Suspense fallback={<div className="h-full w-full" />}>
                <StillBurningAnimatedHero
                  title="Still Burning"
                  images={stillBurningHeroImages}
                  className="h-full"
                  ctaLabel="DESCUBRIR STILL BURNING"
                  ctaHref="/still-burning"
                />
              </Suspense>
            )}

            {section.id === "services" && (
              <div className="w-full max-w-7xl px-6 mt-8 md:mt-10 lg:mt-0">
                <div className="mb-10 text-center">
                  <p className="text-sm uppercase tracking-[0.35em] text-primary-300 dark:text-primary-200">
                    {section.subtitle}
                  </p>
                  <h2 className="mt-2 text-4xl font-bold text-primary-700 dark:text-primary-100 md:text-5xl">
                    {section.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                  <div className="relative overflow-hidden rounded-2xl border border-primary-300/40 bg-primary-100/65 p-6 shadow-lg dark:border-primary-200/20 dark:bg-primary-900/55">
                    <div
                      className={`pointer-events-none absolute inset-0 bg-linear-to-br ${serviceGroups[0].accent}`}
                      aria-hidden="true"
                    />
                    <div className="relative z-10">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500 dark:text-primary-300">
                        {serviceGroups[0].eyebrow}
                      </p>
                      <h3 className="mt-3 text-2xl font-bold text-primary-700 dark:text-primary-100 md:text-3xl">
                        {serviceGroups[0].title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-primary-700 dark:text-primary-200">
                        {serviceGroups[0].description}
                      </p>

                      <div className="mt-6 relative min-h-125 overflow-hidden rounded-2xl border border-primary-300/35 bg-primary-950/25 dark:border-primary-200/15 dark:bg-primary-950/25">
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-linear-to-b from-primary-900/90 via-primary-900/55 to-transparent" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-52 bg-linear-to-t from-primary-900/95 via-primary-900/70 to-transparent" />

                        <div className="absolute inset-x-0 top-0 z-20 p-4 md:p-5">
                          <div className="flex flex-wrap gap-2">
                            {tattooTechniques.map((technique, index) => {
                              const isActive =
                                index === safeActiveTechniqueIndex;

                              return (
                                <button
                                  key={technique.id}
                                  type="button"
                                  onClick={() => setActiveTechniqueIndex(index)}
                                  className={`rounded-full border px-3 py-2 text-sm font-semibold backdrop-blur-lg transition-colors hover:cursor-pointer ${
                                    isActive
                                      ? "border-primary-50 bg-primary-50 text-primary-400"
                                      : "border-primary-50/35 bg-primary-950/35 text-primary-200"
                                  }`}
                                >
                                  {technique.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 z-20 p-5 md:p-6">
                          <div className="flex items-end justify-between gap-4">
                            <div>
                              <h4 className="mt-3 text-3xl text-primary-300 text-primary-50 md:text-4xl font-bold">
                                {activeTechnique.name}
                              </h4>
                            </div>
                            <span className="text-sm font-semibold text-primary-200/90">
                              {String(safeActiveTechniqueIndex + 1).padStart(
                                2,
                                "0",
                              )}{" "}
                              /{" "}
                              {String(tattooTechniques.length).padStart(2, "0")}
                            </span>
                          </div>
                          <p className="mt-3 max-w-2xl text-base text-primary-100 md:text-lg">
                            {activeTechnique.description}
                          </p>
                        </div>

                        <Suspense
                          fallback={
                            <div className="h-full min-h-125 w-full bg-primary-900/30" />
                          }
                        >
                          <Carousel
                            images={tattooTechniques.map((technique) => ({
                              id: technique.id,
                              src: technique.image.src,
                              srcSet: technique.image.srcSet,
                              sizes: technique.image.sizes,
                              title: technique.name,
                            }))}
                            className="h-full"
                            autoDelayMs={7000}
                            dots={false}
                            activeIndex={safeActiveTechniqueIndex}
                            onIndexChange={setActiveTechniqueIndex}
                            slideClassName="h-full min-h-125 rounded-none"
                            imageClassName="rounded-none shadow-none"
                            activeScale={1}
                            inactiveScale={1}
                          />
                        </Suspense>
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-primary-300/40 bg-primary-100/65 p-6 shadow-lg dark:border-primary-200/20 dark:bg-primary-900/55">
                    <div
                      className={`pointer-events-none absolute inset-0 bg-linear-to-br ${serviceGroups[1].accent}`}
                      aria-hidden="true"
                    />
                    <div className="relative z-10">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500 dark:text-primary-300">
                        {serviceGroups[1].eyebrow}
                      </p>
                      <h3 className="mt-3 text-2xl font-bold text-primary-700 dark:text-primary-100 md:text-3xl">
                        {serviceGroups[1].title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-primary-700 dark:text-primary-200">
                        {serviceGroups[1].description}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">
                        {serviceGroups[1].items.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-primary-400/35 bg-primary-50/75 px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm dark:border-primary-200/20 dark:bg-primary-950/35 dark:text-primary-100"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                      <Suspense
                        fallback={
                          <div className="my-10 h-75 w-full bg-primary-900/20" />
                        }
                      >
                        <Carousel
                          images={stillBurningHeroImages.map((technique) => ({
                            id: technique.id,
                            src: technique.src,
                            srcSet: technique.srcSet,
                            sizes: technique.sizes,
                          }))}
                          className="h-full my-10"
                          autoDelayMs={7000}
                          dots={false}
                          activeIndex={safeActiveTechniqueIndex}
                          onIndexChange={setActiveTechniqueIndex}
                          slideClassName="h-full rounded-none"
                          imageClassName="rounded-none shadow-none"
                          activeScale={1}
                          inactiveScale={1}
                        />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {section.id === "estudio" && (
              <div className="relative flex items-center justify-center min-h-screen w-full px-6">
                <div
                  className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                  style={{
                    backgroundImage: "url(/img/flame-frame.svg)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    opacity: 1,
                    mixBlendMode: "normal",
                  }}
                  aria-hidden="true"
                />
                <div className="relative z-10 w-3/4 mx-auto opacity-85">
                  <h2 className="absolute inset-0 z-20 flex items-center justify-center text-5xl font-bold text-primary-100 shadow-2xl text-shadow-lg">
                    HARD TATTOOS FOR HARDER PEOPLE
                  </h2>
                  <Suspense
                    fallback={<div className="h-75 w-full bg-primary-900/20" />}
                  >
                    <Carousel images={galleryImagesBySelection.first} />
                  </Suspense>
                </div>
              </div>
            )}

            {section.id === "contact" && (
              <div className="relative flex w-full items-center justify-center py-8">
                <div className="pointer-events-none absolute inset-0 z-0 bg-primary-950/45" />

                <div className="relative z-10 w-full max-w-4xl xl:max-w-6xl rounded-2xl px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:grid-rows-[auto_auto]">
                  <div className="relative z-10 col-span-full xl:col-span-1 xl:row-start-1">
                    <div className="relative w-full max-h-80 overflow-hidden rounded-xl border border-primary-200/25 bg-primary-900/45">
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
                        <Suspense
                          fallback={
                            <div className="h-75 w-full bg-primary-900/20" />
                          }
                        >
                          <SwipeCarousel
                            images={galleryImagesBySelection.first}
                            dots={false}
                          />
                        </Suspense>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 col-span-1 xl:col-span-1 xl:row-start-2 flex items-center justify-center">
                    <div className="w-full max-w-140">
                      <Suspense
                        fallback={
                          <div className="h-75 w-full rounded-lg bg-primary-900/25" />
                        }
                      >
                        <Map height={300} />
                      </Suspense>
                    </div>
                  </div>

                  <div className="relative z-10 col-span-1 xl:col-span-1 xl:row-span-2 xl:row-start-1 flex items-center justify-center">
                    <Suspense fallback={<div className="h-full w-full" />}>
                      <RevealLinks />
                    </Suspense>
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        );
      })}
    </div>
    <Suspense fallback={null}>
      <ScrollToTop />
    </Suspense>
    </>
  );
}
