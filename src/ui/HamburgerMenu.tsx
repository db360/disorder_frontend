import { motion } from "framer-motion";
import { useState } from "react";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import type { WPMenuItem } from "../types/wordpress";

interface HamburgerMenuProps {
  items: WPMenuItem[];
  loading: boolean;
  error: string | null;
}

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
      duration: 0.2,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.02,
      duration: 0.15,
    },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { when: "beforeChildren", duration: 0.2 },
  },
  closed: {
    opacity: 0,
    y: -12,
    transition: { when: "afterChildren", duration: 0.12 },
  },
};

function MenuOption({ text, to, setOpen }: { text: string; to: string; setOpen: (value: boolean) => void }) {
  return (
    <motion.li
      variants={itemVariants}
      onClick={() => setOpen(false)}
      className="flex items-center w-full p-2 text-sm font-medium whitespace-nowrap rounded-md hover:bg-primary-700 text-primary-600 hover:text-primary-700 transition-colors cursor-pointer dark:text-primary-300 dark:hover:text-primary-200"
    >
      <Link to={to}>{text}</Link>
    </motion.li>
  );
}

export default function HamburgerMenu({ items, loading, error }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div animate={open ? "open" : "closed"} className="relative">
      <button
        onClick={() => setOpen((pv) => !pv)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-primary-900 dark:text-primary-100 bg-primary-200 dark:bg-primary-800 hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors hover:cursor-pointer"
        aria-expanded={open}
        aria-label="Abrir menú"
      >
        {open ? <FiX /> : <FiMenu />}
        <motion.span variants={iconVariants}>
          <FiChevronDown />
        </motion.span>
      </button>

      <motion.ul
        initial={wrapperVariants.closed}
        variants={wrapperVariants}
        style={{ originY: "top", translateX: "-50%" }}
        className="flex flex-col gap-2 p-2 rounded-lg bg-white dark:bg-primary-900 shadow-xl absolute top-[120%] left-[50%] w-56 overflow-hidden z-50"
      >
        {error && (
          <motion.li variants={itemVariants} className="p-2 text-xs text-red-500">
            Error cargando menú
          </motion.li>
        )}
        {!error && loading && (
          <motion.li variants={itemVariants} className="p-2 text-xs text-primary-700">
            Cargando...
          </motion.li>
        )}
        {!error && !loading &&
          items
            .filter((page) => page.slug !== "inicio")
            .slice()
            .sort((a, b) => (a.menuOrder ?? 0) - (b.menuOrder ?? 0))
            .map((page) => (
              <MenuOption
                key={page.id}
                text={page.title}
                to={`/${page.slug}`}
                setOpen={setOpen}
              />
            ))}
      </motion.ul>
    </motion.div>
  );
}
