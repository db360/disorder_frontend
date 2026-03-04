import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Link } from "react-router-dom";
import usePages from "../hooks/usePages";
import ThemeToggle from "../ui/ThemeToggle";
import { useEffect, useMemo, useRef, useState } from "react";
import HamburgerMenu from "../ui/HamburgerMenu";


export default function NavBar() {
  const { pages, loading, error } = usePages();
  const [hidden, setHidden] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const lastScrollY = useRef(0);
  const hiddenAt = useRef(0);
  const headerRef = useRef<HTMLElement | null>(null);
  const { scrollY } = useScroll();
  const logoSrc = "/img/logo-navbar.svg";
  const logoVideoSrc = "/videos/logo-navbar.mp4";
  const logoAlt = "Logo NavBar Disorder Underground Shop";
  const menuItems = useMemo(() => {
    const wpItems = pages
      .filter((page) => page.slug !== "inicio")
      .slice()
      .sort((a, b) => (a.menuOrder ?? 0) - (b.menuOrder ?? 0));

    if (wpItems.some((item) => item.slug === "blog")) {
      return wpItems;
    }

    return [
      ...wpItems,
      {
        id: "static-blog-link",
        slug: "blogs",
        title: "Blogs",
        menuOrder: 5,
      },
    ];
  }, [pages]);

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastScrollY.current;
    const now = Date.now();
    const HIDE_THRESHOLD = 24;
    const SHOW_THRESHOLD = 24;
    const COOLDOWN = 400;

    if (delta > HIDE_THRESHOLD && latest > 60) {
      setHidden(true);
      hiddenAt.current = now;
      lastScrollY.current = latest;
    } else if (delta < -SHOW_THRESHOLD && now - hiddenAt.current > COOLDOWN) {
      setHidden(false);
      lastScrollY.current = latest;
    }
  });

  useEffect(() => {
    const headerEl = headerRef.current;

    if (!headerEl) {
      return;
    }

    const setHeaderHeight = () => {
      const height = headerEl.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        "--navbar-height",
        `${height}px`,
      );
    };

    setHeaderHeight();

    const observer = new ResizeObserver(() => {
      setHeaderHeight();
    });

    observer.observe(headerEl);
    window.addEventListener("resize", setHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", setHeaderHeight);
    };
  }, []);

  const headerClasses =
    "site-navbar transition-colors fixed top-0 left-0 right-0 z-50 w-full bg-primary-200 dark:bg-primary-800";

  return (
    <motion.header
      ref={headerRef}
      className={headerClasses}
      initial={false}
      animate={{ y: hidden ? -80 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ pointerEvents: hidden ? "none" : "auto" }}
    >

      <motion.nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between font-beatstreet">
        {/* Left: Logo (20%) */}
        <div className="basis-1/5 flex items-center justify-start">
          <Link to="/" className="flex items-center" aria-label={logoAlt}>
            {!videoFailed ? (
              <span className="navbar-logo-video-mask" aria-hidden="true">
                <video
                  className="navbar-logo-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onError={() => setVideoFailed(true)}
                >
                  <source src={logoVideoSrc} type="video/webm" />
                </video>
              </span>
            ) : (
              <img
                src={logoSrc}
                alt={logoAlt}
                className="h-12 w-auto"
                loading="eager"
                decoding="async"
              />
            )}
          </Link>
        </div>
        {/* Center: Links (60%) */}
        <div className="basis-3/5 hidden lg:flex items-center justify-center text-2xl">
          {error && (
            <span className="text-red-600 dark:text-red-400 text-base">
              Error cargando menú
            </span>
          )}
          {!error && loading && (
            <span className="text-primary-700 dark:text-primary-300 text-base">Cargando...</span>
          )}
          {!error && !loading && (
            <motion.ul
              className="flex gap-10 items-center"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {menuItems.map((page) => (
                  <motion.li
                    key={page.id}
                    className="flex items-center"
                    variants={itemVariants}
                  >
                    <Link
                      to={`/${page.slug}`}
                      className="text-primary-900 dark:text-primary-100 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      {page.title}
                    </Link>
                  </motion.li>
                ))}
            </motion.ul>
          )}
        </div>
        {/* Right: Theme Button (20%) */}
        <div className="basis-1/5 flex items-center justify-end gap-3">
          <ThemeToggle />
          <div className="lg:hidden">
            <HamburgerMenu items={menuItems} loading={loading} error={error} />
          </div>
        </div>
      </motion.nav>
    </motion.header>
  );
}
