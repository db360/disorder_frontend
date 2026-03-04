import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { ParsedContentImage } from "../lib/parseWordPressContent";

type StillBurningAnimatedHeroProps = {
  title?: string;
  images: ParsedContentImage[];
  className?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function StillBurningAnimatedHero({
  title = "Still Burning",
  images,
  className,
  ctaLabel,
  ctaHref,
}: StillBurningAnimatedHeroProps) {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;

    const intervalId = window.setInterval(() => {
      setAnimationStep((prevStep) => prevStep + 1);
    }, 1800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [images.length]);

  const backgroundSlots = [
    "top-6 left-4 w-32 sm:w-40 md:w-56 lg:w-64 -rotate-8",
    "top-14 right-6 w-28 sm:w-36 md:w-52 lg:w-60 rotate-6",
    "top-1/2 -translate-y-1/2 left-10 w-36 sm:w-44 md:w-60 lg:w-72 -rotate-3",
    "top-1/2 -translate-y-1/2 right-10 w-34 sm:w-42 md:w-56 lg:w-68 rotate-4",
    "bottom-8 left-8 w-30 sm:w-40 md:w-54 lg:w-62 rotate-8",
    "bottom-10 right-8 w-32 sm:w-40 md:w-56 lg:w-64 -rotate-6",
  ];

  const visibleGroups = 3;
  const activeGroup = animationStep % visibleGroups;

  return (
    <div className={`relative w-full min-h-full overflow-hidden bg-primary-950/65 ${className ?? ""}`}>
      <div className="pointer-events-none absolute inset-0 bg-primary-950/40" />

      {images.length > 0 &&
        backgroundSlots.map((slotClassName, slotIndex) => {
          const slotGroup = slotIndex % visibleGroups;
          const slotCycle = Math.floor(
            (animationStep + (visibleGroups - slotGroup)) / visibleGroups,
          );
          const image = images[(slotIndex + slotCycle) % images.length];
          const isActive = slotGroup === activeGroup;

          return (
            <div
              key={`slot-${slotIndex}`}
              className={`pointer-events-none absolute ${slotClassName}`}
            >
              <motion.img
                key={`${slotIndex}-${image.src}-${slotCycle}`}
                src={image.src}
                srcSet={image.srcSet}
                sizes={
                  image.sizes || "(min-width: 1280px) 22vw, (min-width: 768px) 28vw, 40vw"
                }
                alt=""
                aria-hidden="true"
                className="h-auto w-full rounded-xl object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 0.55 : 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            </div>
          );
        })}

      <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8">
          <h1 className="w-full" aria-label={title}>
          <span className="sr-only">{title}</span>
          <img
            src="/img/still-burning.svg"
            alt=""
            aria-hidden="true"
            className="mx-auto w-full"
          />
          </h1>

          {ctaLabel && ctaHref && (
            <Link
              to={ctaHref}
              className="inline-flex items-center justify-center rounded-lg border border-primary-200/70 bg-primary-100/90 px-6 py-3 text-sm font-bold tracking-wide text-primary-800 shadow-lg transition-colors hover:bg-primary-50 dark:border-primary-200/60 dark:bg-primary-200/90 dark:text-primary-900 dark:hover:bg-primary-100"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
