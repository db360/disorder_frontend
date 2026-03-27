import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO";

interface ErrorProps {
    statusCode?: number;
    title?: string;
    message?: string;
}

export default function Error({
    statusCode = 404,
    title = "Página no encontrada",
    message = "La página que buscas no existe o ha sido movida.",
}: ErrorProps) {
    useSEO(undefined, {
        title: `${statusCode} - ${title}`,
        description: message,
    });

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center page-navbar-offset">
            <h1 className="text-8xl font-bold text-primary-600 dark:text-primary-300 font-beatstreet">
                {statusCode}
            </h1>
            <h2 className="mt-4 text-2xl font-semibold text-primary-700 dark:text-primary-100">
                {title}
            </h2>
            <p className="mt-2 max-w-md text-primary-600 dark:text-primary-300">
                {message}
            </p>
            <Link
                to="/"
                className="mt-8 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400"
            >
                Volver al inicio
            </Link>
        </div>
    );
}