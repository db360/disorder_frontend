import { useState } from "react";

const CF7_FORM_ID = "105";
const WORDPRESS_BASE_URL = import.meta.env.VITE_WORDPRESS_URL;

if (!WORDPRESS_BASE_URL) {
    console.error("VITE_WORDPRESS_URL is not defined in environment variables.");
}

const normalizedBaseUrl = WORDPRESS_BASE_URL?.replace(/\/$/, "") ?? "";
const CF7_ENDPOINT = `${normalizedBaseUrl}/wp-json/contact-form-7/v1/contact-forms/${CF7_FORM_ID}/feedback`;

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const unitTag = `wpcf7-f${CF7_FORM_ID}-p0-o1`;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            const formData = new FormData(event.currentTarget);
            const response = await fetch(CF7_ENDPOINT, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (!response.ok || data.status !== "mail_sent") {
                const message =
                    data?.message || "No se pudo enviar el formulario. Intentalo de nuevo.";
                console.error("CF7 error", { status: response.status, data });
                setStatusMessage(message);
                return;
            }

            setStatusMessage("Mensaje enviado. Gracias por contactarnos.");
            event.currentTarget.reset();
        } catch (error) {
            console.error("CF7 network error", error);
            setStatusMessage("Error de red. Intentalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            className="max-w-md mx-auto text-primary-900 dark:text-primary-100 py-5"
            onSubmit={handleSubmit}
        >
            <input type="hidden" name="_wpcf7" value={CF7_FORM_ID} />
            <input type="hidden" name="_wpcf7_unit_tag" value={unitTag} />
            <input type="hidden" name="_wpcf7_container_post" value="0" />
            <div className="relative z-0 w-full mb-5 group">
                <input
                    type="text"
                    name="your-name"
                    id="your-name"
                    className="block py-2.5 px-0 w-full text-sm text-heading dark:text-primary-100 bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
                    placeholder=" "
                    required
                />
                <label
                    htmlFor="your-name"
                    className="absolute text-sm text-body dark:text-primary-100 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                >
                    Tu nombre
                </label>
            </div>
            <div className="relative z-0 w-full mb-5 group">
                <input
                    type="email"
                    name="your-email"
                    id="your-email"
                    className="block py-2.5 px-0 w-full text-sm text-heading dark:text-primary-100 bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
                    placeholder=" "
                    required
                />
                <label
                    htmlFor="your-email"
                    className="absolute text-sm text-body dark:text-primary-100 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                >
                    Tu correo electronico
                </label>
            </div>
            <div className="relative z-0 w-full mb-5 group">
                <input
                    type="text"
                    name="your-subject"
                    id="your-subject"
                    className="block py-2.5 px-0 w-full text-sm text-heading dark:text-primary-100 bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
                    placeholder=" "
                    required
                />
                <label
                    htmlFor="your-subject"
                    className="absolute text-sm text-body dark:text-primary-100 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                >
                    Asunto
                </label>
            </div>
            <div className="relative z-0 w-full mb-6 group">
                <textarea
                    name="your-message"
                    id="your-message"
                    rows={4}
                    className="block py-2.5 px-0 w-full text-sm text-heading dark:text-primary-100 bg-transparent border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer resize-none"
                    placeholder=" "
                />
                <label
                    htmlFor="your-message"
                    className="absolute text-sm text-body dark:text-primary-100 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                >
                    Tu mensaje (opcional)
                </label>
            </div>
            <button
                type="submit"
                className="text-white bg-primary-700 box-border border border-transparent hover:bg-primary-600 hover:cursor-pointer focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none disabled:opacity-60"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
            {statusMessage && (
                <p className="mt-4 text-sm" role="status" aria-live="polite">
                    {statusMessage}
                </p>
            )}
        </form>
    );
}