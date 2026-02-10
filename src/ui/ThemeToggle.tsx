import { motion } from "framer-motion";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../hooks/useTheme";

const TOGGLE_CLASSES =
  "text-xs md:text-sm font-medium flex items-center gap-2 px-3 md:pl-3 md:pr-3.5 py-2 md:py-1.5 transition-colors relative z-10";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const selected = theme === "dark" ? "dark" : "light";

  const setLight = () => {
    if (selected !== "light") {
      toggleTheme();
    }
  };

  const setDark = () => {
    if (selected !== "dark") {
      toggleTheme();
    }
  };

  return (
    <div className="relative flex w-fit items-center rounded-full border border-primary-300 dark:border-primary-700 bg-primary-100/80 dark:bg-primary-800/60">
      <button
        type="button"
        className={`${TOGGLE_CLASSES} ${
          selected === "light" ? "text-primary-100" : "text-primary-700 dark:text-primary-300  hover:cursor-pointer"
        }`}
        onClick={setLight}
        aria-pressed={selected === "light"}
        aria-label="Activar modo claro"
      >
        <FiSun className="relative z-10 text-base md:text-sm" />
      </button>
      <button
        type="button"
        className={`${TOGGLE_CLASSES} ${
          selected === "dark" ? "text-primary-100" : "text-primary-700 dark:text-primary-300 hover:cursor-pointer"
        }`}
        onClick={setDark}
        aria-pressed={selected === "dark"}
        aria-label="Activar modo oscuro"
      >
        <FiMoon className="relative z-10 text-base md:text-sm" />
      </button>
      <div
        className={`absolute inset-0 z-0 flex ${
          selected === "dark" ? "justify-end" : "justify-start"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", damping: 15, stiffness: 250 }}
          className="h-full w-1/2 rounded-full bg-primary-500 dark:bg-primary-500"
        />
      </div>
    </div>
  );
}
