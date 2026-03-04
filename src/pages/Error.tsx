import useSEO from "../hooks/useSEO";

export default function Error(){
    useSEO(undefined, {
        title: "404 - Página no encontrada",
        description: "La página que buscas no está disponible.",
    });

    return <div>404 - Page Not Found</div>;
}