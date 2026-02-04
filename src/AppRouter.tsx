
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { usePages } from "./context/PagesContext";
import Layout from "./Layout/Layout";
import Page from "./Page";

function SlugPage({ loading }: { loading: boolean }) {
  const params = useParams();
  const slug = params.slug ?? "";
  return <Page slug={slug} loading={loading} />;
}

const AppRouter = () => {
  const { pages, loading } = usePages();

  return (
   <BrowserRouter>
      <Layout>
        <Routes>
          {/* Ruta genérica para manejar accesos directos antes de que se carguen los slugs */}
          <Route
            path="/:slug"
            element={<SlugPage loading={loading} />}
          />
          {!loading && pages && pages.map(page => (
            <Route
              key={page.id}
              path={`/${page.slug}`}
              element={<Page slug={page.slug} loading={loading} />}
            />
          ))}
          <Route path="/" element={<Page slug="inicio" loading={loading} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRouter;