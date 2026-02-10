
import { useEffect, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, useLocation } from "react-router-dom";
import Layout from "../Layout/Layout";
import Page from "../Page";
import usePages from "../hooks/usePages";
import Error from "../pages/Error";

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
        <Routes>
          <Route path="/" element={<Page slug="inicio" loading={loading} />} />
          {/* Ruta genérica para manejar accesos directos antes de que se carguen los slugs */}
          <Route path="/:slug" element={<SlugPage loading={loading} />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRouter;