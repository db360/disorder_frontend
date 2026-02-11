import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getPageBySlug } from "../lib/apiFunctions";
import type { GetPageBySlugQuery } from "../api/graphql/generated";
import LoadingSpinner from "../ui/LoadingSpinner";
import useSEO from "../hooks/useSEO";
import ScrollText from "../ui/ScrollText";

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
      { id: "services", title: "Sección 3", subtitle: "Texto de apoyo" },
      { id: "gallery", title: "Sección 4", subtitle: "Texto de apoyo" },
      { id: "contact", title: "Sección 5", subtitle: "Texto de apoyo" },
    ],
    [page],
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
            {section.id !== "hero" && (
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
              <div className="w-full">
                <ScrollText text="Disorder Underground Shop" />
              </div>
            )}
          </motion.section>
        );
      })}
    </div>
  );
}
