
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getPagesSlugs } from "./lib/apiFunctions";
import type { WPMenuItem } from "./types/wordpress";
import Layout from "./Layout/Layout";
import Page from "./Page";

const AppRouter = () => {
  const [pages, setPages] = useState<WPMenuItem[]>([]);
  useEffect(() => {
    getPagesSlugs().then(setPages);
  }, []);

  return (
   <BrowserRouter>
      <Layout>
        <Routes>
          {pages.map(page => (
            <Route
              key={page.id}
              path={`/${page.slug}`}
              element={<Page slug={page.slug} />}
            />
          ))}
          <Route path="/" element={<Page slug="inicio" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRouter;