import { Link } from "react-router-dom";
import usePages from "../hooks/usePages";
import { contactEmail, whatsappNumber } from "../config/site";

export default function Footer() {
  const { pages, loading, error } = usePages();

  return (
    <footer className="site-footer bg-primary-200 dark:bg-primary-800 transition-colors">
      <div className="max-w-5xl mx-auto px-6 py-12 grid gap-10 text-center justify-items-center md:text-left md:grid-cols-2 md:justify-items-center md:gap-16">
        <div className="space-y-3 max-w-sm mx-auto">
          <h3 className="text-xl font-beatstreet text-primary-900 dark:text-primary-100">
            Navegacion
          </h3>
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm">
              Error cargando links
            </p>
          )}
          {!error && loading && (
            <p className="text-primary-700 dark:text-primary-300 text-sm">
              Cargando...
            </p>
          )}
          {!error && !loading && (
            <ul className="space-y-2 text-primary-800 dark:text-primary-100">
              {(() => {
                const wpItems = pages
                  .filter((page) => page.slug !== "inicio")
                  .slice()
                  .sort((a, b) => (a.menuOrder ?? 0) - (b.menuOrder ?? 0));
                const staticItems = [
                  {
                    id: "static-blog-link",
                    slug: "blogs",
                    title: "Blogs",
                    menuOrder: 90,
                  },
                  {
                    id: "static-site-map-link",
                    slug: "mapa-del-sitio",
                    title: "Mapa del sitio",
                    menuOrder: 91,
                  },
                  {
                    id: "static-accesibilidad-link",
                    slug: "declaracion-accesibilidad",
                    title: "Declaracion de accesibilidad",
                    menuOrder: 92,
                  },
               
                ];

                const menuItems = [...wpItems];

                staticItems.forEach((item) => {
                  if (!menuItems.some((menuItem) => menuItem.slug === item.slug)) {
                    menuItems.push(item);
                  }
                });

                return menuItems
                  .slice()
                  .sort((a, b) => (a.menuOrder ?? 0) - (b.menuOrder ?? 0))
                  .map((page) => (
                  <li key={page.id}>
                    <Link
                      to={`/${page.slug}`}
                      className="hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
                    >
                      {page.title}
                    </Link>
                  </li>
                ));
              })()}
            </ul>
          )}
        </div>

        <div className="space-y-3 max-w-sm mx-auto">
          <h3 className="text-xl font-beatstreet text-primary-900 dark:text-primary-100">
            Contacto
          </h3>
          <div className="text-primary-700 dark:text-primary-200 space-y-2">
            <p>Escribinos para pedidos, colaboraciones o dudas.</p>
            <p className="text-sm">Email: {contactEmail}</p>
            <p className="text-sm">WhatsApp: {whatsappNumber}</p>
          </div>
        </div>
      </div>



         {/* Copyright */}

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-primary-700 dark:text-primary-300 text-center block">
                © 2026 <a href="https://universoweb.es/" className="hover:underline">UniversoWeb | Con el ❤️ desde el Universo</a>. All Rights Reserved 2026.
            </span>
        </div>
      {/* Kit Digital section */}
      <div className="mx-auto max-w-3/4 p-4">
        <p className="text-xs sm:text-sm text-center mb-2 dark:text-white text-black px-4">
          Financiado por la Unión Europea con el programa Kit Digital por los
          fondos Next Generation (EU) del mecanismo de recuperación y
          resiliencia
        </p>
        <img
          src="/img/Kit-Digital-Banner.webp"
          alt="Kit Digital - Financiado por la Unión Europea"
          className="w-full h-auto"
          width={2048}
          height={154}
          loading="lazy"
          decoding="async"
        />
      </div>
    </footer>
  );
}
