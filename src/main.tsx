import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getPagesSlugsTitles } from "./hooks/apiFunctions.clean";
import Page from "./Page"; // Componente que recibe el slug
import App from "./App";

function AppRouter() {
  const [pages, setPages] = useState([]);
  useEffect(() => {
    getPagesSlugsTitles().then(setPages);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {pages.map(page => (
          <App
            key={page.id}
            path={`/${page.slug}`}
            element={<Page slug={page.slug} />}
          />
        ))}
        {/* Ruta por defecto, por ejemplo */}
        <Route path="/" element={<Page slug="inicio" />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);
