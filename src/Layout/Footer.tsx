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
              <ul className="text-primary-800 dark:text-primary-100 grid gap-x-6 gap-y-2 [@media(min-width:1250px)]:grid-cols-2">
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
                    id: "static-aviso-legal-link",
                    slug: "aviso-legal",
                    title: "Aviso legal",
                    menuOrder: 92,
                  },
                  {
                    id: "static-accesibilidad-link",
                    slug: "declaracion-accesibilidad",
                    title: "Declaracion de accesibilidad",
                    menuOrder: 99,
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
          <p className="text-sm text-primary-800 dark:text-primary-200">
            Escribinos para pedidos, colaboraciones o dudas.
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-800 dark:text-primary-300 mb-0.5">Email</p>
              <p className="text-sm text-primary-900 dark:text-primary-100">{contactEmail}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-800 dark:text-primary-300 mb-0.5">WhatsApp</p>
              <p className="text-sm text-primary-900 dark:text-primary-100">{whatsappNumber}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-800 dark:text-primary-300 mb-0.5">Dirección</p>
              <p className="text-sm text-primary-900 dark:text-primary-100">
                Plaza de la Libertad 3, Local 7B<br />San Pedro Alcántara
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-800 dark:text-primary-300 mb-0.5">Horario</p>
              <p className="text-sm text-primary-900 dark:text-primary-100">
                Lun – Vie: 10:00 – 14:00 / 17:00 – 20:00
              </p>
            </div>
          </div>
        </div>
      </div>



         {/* Copyright */}

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-primary-900 dark:text-primary-100 text-center block">
                © 2026 <a href="https://universoweb.es/" className="text-primary-900 dark:text-primary-100 hover:underline">UniversoWeb | Con el ❤️ desde el Universo</a>. All Rights Reserved 2026.
            </span>
        </div>
      {/* Kit Digital section */}
      <div className="mx-auto max-w-full sm:max-w-3/4 p-4">
        <p className="text-xs sm:text-sm text-center mb-2 dark:text-white text-black max-w-xs sm:max-w-none mx-auto">
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
