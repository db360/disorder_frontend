import { useEffect, useMemo, useState } from "react";
import { motion, type PanInfo } from "framer-motion";

export type CarouselImage = {
  id: string | number;
  src: string;
  srcSet?: string;
  sizes?: string;
  title?: string;
};

type SwipeCarouselProps = {
  images?: CarouselImage[];
  className?: string;
  autoDelayMs?: number;
  dots?: boolean;
  onIndexChange?: (index: number) => void;
  activeIndex?: number;
  slideClassName?: string;
  imageClassName?: string;
  activeScale?: number;
  inactiveScale?: number;
};

const ONE_SECOND = 1000;
const AUTO_DELAY = ONE_SECOND * 10;
const DRAG_BUFFER = 50;

const SPRING_OPTIONS = {
  type: "spring" as const,
  mass: 3,
  stiffness: 400,
  damping: 50,
};

export default function SwipeCarousel({
  dots = true,
  images,
  className,
  autoDelayMs = AUTO_DELAY,
  onIndexChange,
  activeIndex,
  slideClassName,
  imageClassName,
  activeScale = 0.95,
  inactiveScale = 0.85,
}: SwipeCarouselProps) {
  const carouselImages = useMemo(
    () => (images ?? []).filter((image) => Boolean(image?.src)),
    [images],
  );
  const [imgIndex, setImgIndex] = useState(0);
  const isControlled = typeof activeIndex === "number";
  const maxIndex = Math.max(carouselImages.length - 1, 0);
  const currentIndex = Math.min(isControlled ? activeIndex : imgIndex, maxIndex);

  const updateIndex = (nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(nextIndex, maxIndex));

    if (!isControlled) {
      setImgIndex(boundedIndex);
    }

    onIndexChange?.(boundedIndex);
  };

  useEffect(() => {
    if (!isControlled) {
      onIndexChange?.(currentIndex);
    }
  }, [currentIndex, isControlled, onIndexChange]);

  useEffect(() => {
    if (carouselImages.length <= 1) {
      return;
    }

    const intervalRef = setInterval(() => {
      updateIndex(currentIndex >= carouselImages.length - 1 ? 0 : currentIndex + 1);
    }, autoDelayMs);

    return () => clearInterval(intervalRef);
  }, [autoDelayMs, carouselImages.length, currentIndex]);

  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const x = info.offset.x;

    if (x <= -DRAG_BUFFER && currentIndex < carouselImages.length - 1) {
      updateIndex(currentIndex + 1);
    } else if (x >= DRAG_BUFFER && currentIndex > 0) {
      updateIndex(currentIndex - 1);
    }
  };

  if (carouselImages.length === 0) {
    return null;
  }

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div
        drag="x"
        dragConstraints={{
          left: 0,
          right: 0,
        }}
        animate={{
          x: `-${currentIndex * 100}%`,
        }}
        transition={SPRING_OPTIONS}
        onDragEnd={onDragEnd}
        className="flex cursor-grab items-center active:cursor-grabbing"
      >
        <Images
          images={carouselImages}
          imgIndex={currentIndex}
          slideClassName={slideClassName}
          imageClassName={imageClassName}
          activeScale={activeScale}
          inactiveScale={inactiveScale}
        />
      </motion.div>
      {dots && (
        <Dots
          images={carouselImages}
          imgIndex={currentIndex}
          setImgIndex={updateIndex}
        />
      )}
    </div>
  );
}

type ImagesProps = {
  images: CarouselImage[];
  imgIndex: number;
  slideClassName?: string;
  imageClassName?: string;
  activeScale: number;
  inactiveScale: number;
};

function Images({
  images,
  imgIndex,
  slideClassName,
  imageClassName,
  activeScale,
  inactiveScale,
}: ImagesProps) {
  return (
    <>
      {images.map((image, idx) => {
        return (
          <motion.div
            key={image.id}
            animate={{
              scale: imgIndex === idx ? activeScale : inactiveScale,
            }}
            transition={SPRING_OPTIONS}
            className={`aspect-video w-full min-w-full shrink-0 rounded-xl ${slideClassName ?? ""}`}
          >
            <img
              src={image.src}
              srcSet={image.srcSet}
              sizes={image.sizes}
              alt={image.title ?? "Imagen"}
              className={`h-full w-full rounded-xl object-cover shadow-2xl ${imageClassName ?? ""}`}
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        );
      })}
    </>
  );
}

type DotsProps = {
  images: CarouselImage[];
  imgIndex: number;
  setImgIndex: (index: number) => void;
};

function Dots({ images, imgIndex, setImgIndex }: DotsProps) {
  return (
    <div className="mt-4 flex w-full justify-center gap-2">
      {images.map((image, idx) => {
        return (
          <button
            key={image.id}
            onClick={() => setImgIndex(idx)}
            aria-label={`Ir a la imagen ${idx + 1}`}
            title={`Ir a la imagen ${idx + 1}`}
            className={`h-3 w-3 rounded-full transition-colors hover:cursor-pointer ${
              idx === imgIndex ? "bg-neutral-50" : "bg-neutral-500"
            }`}
          />
        );
      })}
    </div>
  );
}

