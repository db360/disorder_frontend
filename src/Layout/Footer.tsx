import { Link } from "react-router-dom";
import usePages from "../hooks/usePages";

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
                        <p className="text-primary-700 dark:text-primary-300 text-sm">Cargando...</p>
                    )}
                    {!error && !loading && (
                        <ul className="space-y-2 text-primary-800 dark:text-primary-100">
                            {pages
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
                                ))}
                        </ul>
                    )}
                </div>

                <div className="space-y-3 max-w-sm mx-auto">
                    <h3 className="text-xl font-beatstreet text-primary-900 dark:text-primary-100">
                        Contacto
                    </h3>
                    <div className="text-primary-700 dark:text-primary-200 space-y-2">
                        <p>Escribinos para pedidos, colaboraciones o dudas.</p>
                        <p className="text-sm">
                            Email: info@disorderunderground.com
                        </p>
                        <p className="text-sm">WhatsApp: +34 623 61 29 05</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-primary-300/50 dark:border-primary-700/60">
                <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-primary-700 dark:text-primary-300 flex flex-col md:flex-row items-center justify-between gap-2">
                    <span>© 2026 Disorder Underground Shop</span>
                </div>
            </div>
        </footer>
    );
}