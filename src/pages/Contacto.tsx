import ContactForm from "../ui/ContactForm";

export default function Contacto() {
    return (
        <div
            className="min-h-screen px-4"
            style={{ paddingTop: "var(--navbar-height, 80px)" }}
        >
            <ContactForm />
        </div>
    );
}