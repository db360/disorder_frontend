import { FaWhatsapp } from "react-icons/fa";
import { getWhatsappHref } from "../config/site";

export default function WhatsAppButton() {
  const href = getWhatsappHref();

  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-3 rounded-full border border-primary-50/20 bg-[#25D366] px-4 py-3 font-semibold text-primary-950 shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:-translate-y-1"
    >
      <FaWhatsapp className="h-6 w-6 shrink-0" aria-hidden="true" />
      <span className="hidden text-sm md:inline">WhatsApp</span>
    </a>
  );
}
