import ContactForm from "../ui/ContactForm";
import Map from "../ui/Map";
import ScrollText from "../ui/ScrollText";
import useSEO from "../hooks/useSEO";

export default function Contacto() {
    useSEO(undefined, {
        title: "Contacto",
        description: "Consulta cualquier duda y contacta con Disorder Underground Shop.",
    });

    return (
        <div className="min-h-screen px-4 page-navbar-offset">
            <ScrollText
                text="Contacto"
                textSize={160}
                textY={37}
                containerClassName="h-[35vh] md:h-[25vh]"
            />
            <div className="bg-primary-600 text-center text-primary-100 mb-12 py-4">
            <h2 className="text-3xl mb-5">Consulta cualquier duda, contactaremos contigo en el menor tiempo posible</h2>
            <h3 className="text-2xl ">Nos encontramos en: Plaza de la Libertad 3 Local 7B - San Pedro Alcántara</h3>

            </div>
            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-8 pb-12 lg:grid-cols-2">
                <div className="w-full">
                    <ContactForm />
                </div>
                <div className="w-full rounded-xl border border-primary-300/40 bg-primary-50/75 p-4 shadow-lg dark:border-primary-200/20 dark:bg-primary-900/55">
                    <Map height={460} />
                </div>
            </div>

        </div>
    );
}