import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const CF7_FORM_ID = "105";
const WORDPRESS_BASE_URL = import.meta.env.VITE_WORDPRESS_URL;

if (!WORDPRESS_BASE_URL) {
    console.error("VITE_WORDPRESS_URL is not defined in environment variables.");
}

const normalizedBaseUrl = WORDPRESS_BASE_URL?.replace(/\/$/, "") ?? "";
const CF7_ENDPOINT = `${normalizedBaseUrl}/wp-json/contact-form-7/v1/contact-forms/${CF7_FORM_ID}/feedback`;

type Cf7Response = {
    status?: string;
    message?: string;
};

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [statusType, setStatusType] = useState<"success" | "error" | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const unitTag = `wpcf7-f${CF7_FORM_ID}-p0-o1`;

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setStatusMessage(null);
        setStatusType(null);
    };

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setStatusMessage(null);
        setStatusType(null);
        setShowSuccessModal(false);
        const form = event.currentTarget;

        try {
            const formData = new FormData(form);
            const response = await fetch(CF7_ENDPOINT, {
                method: "POST",
                body: formData,
            });

            const responseContentType = response.headers.get("content-type") || "";
            let data: Cf7Response | null = null;
            let responseBodyText = "";

            if (responseContentType.includes("application/json")) {
                data = (await response.json()) as Cf7Response;
            } else {
                responseBodyText = await response.text();
            }

            if (!response.ok || data?.status !== "mail_sent") {
                let message =
                    data?.message || "No se pudo enviar el formulario. Intentalo de nuevo.";

                if (response.status === 504) {
                    message =
                        "El servidor ha tardado demasiado en responder (504). Reintenta en unos minutos.";
                }

                console.error("CF7 error", {
                    status: response.status,
                    data,
                    responseContentType,
                    responseBodyText,
                });
                setStatusType("error");
                setStatusMessage(message);
                return;
            }

            setStatusMessage("Mensaje enviado. Gracias por contactarnos.");
            setStatusType("success");
            setShowSuccessModal(true);
            form.reset();
        } catch (error) {
            console.error("CF7 network error", error);
            setStatusType("error");
            setStatusMessage("Error de red. Intentalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            className="mx-auto w-full max-w-2xl rounded-xl border border-primary-300/40 bg-primary-50/75 p-6 text-primary-900 shadow-lg dark:border-primary-200/20 dark:bg-primary-900/55 dark:text-primary-100"
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
                className="text-white bg-primary-500 box-border border border-transparent hover:bg-primary-600 hover:cursor-pointer focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none disabled:opacity-60 rounded-lg"
       
                disabled={isSubmitting}
            >
                {isSubmitting ? "Enviando..." : "Enviar"}
            </button>

            <p className="mt-4 text-sm text-primary-700 dark:text-primary-200">
                Al enviar este formulario aceptas nuestro tratamiento de datos para contacto. {" "}
                <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="font-semibold underline underline-offset-2 hover:cursor-pointer"
                >
                    Ver aviso legal
                </button>
            </p>

            {statusType === "error" && statusMessage && (
                <p
                    className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
                    role="status"
                    aria-live="polite"
                >
                    {statusMessage}
                </p>
            )}

            <AnimatePresence>
                {showPrivacyModal && (
                    <motion.div
                        className="fixed inset-0 z-120 flex items-center justify-center bg-primary-950/70 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-lg rounded-2xl border border-primary-200/35 bg-primary-100 p-6 text-left shadow-2xl dark:border-primary-200/20 dark:bg-primary-900"
                            initial={{ opacity: 0, y: 24, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.95 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="contact-privacy-title"
                        >
                            <h3
                                id="contact-privacy-title"
                                className="text-2xl font-bold text-primary-700 dark:text-primary-100"
                            >
                                Aviso legal de privacidad
                            </h3>
                            <p className="mt-4 text-primary-700 dark:text-primary-200 leading-relaxed">
                                Los datos que envias en este formulario se usan exclusivamente para atender tu consulta y contactarte.
                                No compartimos tu informacion con terceros ni la utilizamos para fines comerciales ajenos a esta comunicacion.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowPrivacyModal(false)}
                                className="mt-6 inline-flex items-center justify-center rounded-lg border border-primary-400 bg-primary-600 px-4 py-2 text-sm font-semibold text-primary-50 transition-colors hover:cursor-pointer hover:bg-primary-500 dark:border-primary-300 dark:bg-primary-500 dark:hover:bg-primary-400"
                            >
                                Entendido
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {showSuccessModal && (
                    <motion.div
                        className="fixed inset-0 z-120 flex items-center justify-center bg-primary-950/70 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-md rounded-2xl border border-primary-200/35 bg-primary-100 p-6 text-center shadow-2xl dark:border-primary-200/20 dark:bg-primary-900"
                            initial={{ opacity: 0, y: 24, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.95 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="contact-success-title"
                        >
                            <h3
                                id="contact-success-title"
                                className="text-2xl font-bold text-primary-700 dark:text-primary-100"
                            >
                                Mensaje enviado
                            </h3>
                            <p className="mt-3 text-primary-700 dark:text-primary-200">
                                {statusMessage}
                            </p>
                            <button
                                type="button"
                                onClick={closeSuccessModal}
                                className="mt-6 inline-flex items-center justify-center rounded-lg border border-primary-400 bg-primary-600 px-4 py-2 text-sm font-semibold text-primary-50 transition-colors hover:cursor-pointer hover:bg-primary-500 dark:border-primary-300 dark:bg-primary-500 dark:hover:bg-primary-400"
                            >
                                Cerrar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </form>
    );
}