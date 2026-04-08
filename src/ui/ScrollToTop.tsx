import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary-700 text-primary-50 shadow-lg hover:bg-primary-600 dark:bg-primary-300 dark:text-primary-900 dark:hover:bg-primary-200 transition-colors hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
