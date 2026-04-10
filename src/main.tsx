import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.css";
import AppRouter from "./router/AppRouter";
import { PagesProvider } from "./context/PagesContext";

// Ocultar iframes decorativos inyectados por framer-motion de la AT
const hideDecorativeIframes = (root: Node) => {
  const iframes = (root instanceof Element ? root : document).querySelectorAll(
    'iframe[role="presentation"]'
  );
  iframes.forEach((iframe) => {
    if (!iframe.hasAttribute("aria-hidden")) {
      iframe.setAttribute("aria-hidden", "true");
    }
  });
};

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof Element) {
        if (node.matches('iframe[role="presentation"]')) {
          node.setAttribute("aria-hidden", "true");
        }
        hideDecorativeIframes(node);
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
hideDecorativeIframes(document);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PagesProvider>
      <AppRouter />
    </PagesProvider>
  </StrictMode>
);