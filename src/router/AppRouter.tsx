
import { Suspense, lazy, useEffect, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, useLocation } from "react-router-dom";
import Layout from "../Layout/Layout";
import usePages from "../hooks/usePages";
import LoadingSpinner from "../ui/LoadingSpinner";

const Page = lazy(() => import("../Page"));
const Error = lazy(() => import("../pages/Error"));
const Blog = lazy(() => import("../pages/Blog"));
const BlogPost = lazy(() => import("../pages/BlogPost"));
const MapaSitio = lazy(() => import("../pages/MapaSitio"));

function SlugPage({ loading }: { loading: boolean }) {
  const params = useParams();
  const slug = params.slug ?? "";
  return <Page slug={slug} loading={loading} />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return null;
}

const AppRouter = () => {
  const { loading } = usePages();
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Page slug="inicio" loading={loading} />} />
            <Route path="/blogs" element={<Blog />} />
            <Route path="/blogs/:slug" element={<BlogPost />} />
            <Route path="/mapa-del-sitio" element={<MapaSitio />} />
            {/* Ruta genérica para manejar accesos directos antes de que se carguen los slugs */}
            <Route path="/:slug" element={<SlugPage loading={loading} />} />
            <Route path="*" element={<Error />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRouter;