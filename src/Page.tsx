import { Suspense, lazy } from "react";
import type { ReactElement } from "react";
import LoadingSpinner from "./ui/LoadingSpinner";

const Contacto = lazy(() => import("./pages/Contacto"));
const DeclaracionAccesibilidad = lazy(
  () => import("./pages/DeclaracionAccesibilidad"),
);
const Equipo = lazy(() => import("./pages/Equipo"));
const Error = lazy(() => import("./pages/Error"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Historia = lazy(() => import("./pages/Historia"));
const Index = lazy(() => import("./pages/Index"));
const StillBurning = lazy(() => import("./pages/StillBurning"));

const SLUG_COMPONENTS: Record<string, ReactElement> = {
  inicio: <Index />,
  contacto: <Contacto />,
  estudio: <Historia />,
  galeria: <Gallery />,
  "nuestro-equipo": <Equipo />,
  "still-burning": <StillBurning />,
  "declaracion-accesibilidad": <DeclaracionAccesibilidad />,
};

const Page = ({ slug, loading }: { slug: string; loading: boolean }) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  const content = SLUG_COMPONENTS[slug] ?? <Error />;
  return <Suspense fallback={<LoadingSpinner />}>{content}</Suspense>;
};

export default Page;