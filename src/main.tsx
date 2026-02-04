import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./AppRouter";
import { PagesProvider } from "./context/PagesContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PagesProvider>
      <AppRouter />
    </PagesProvider>
  </StrictMode>
);