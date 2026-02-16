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
}: SwipeCarouselProps) {
  const carouselImages = useMemo(
    () => (images ?? []).filter((image) => Boolean(image?.src)),
    [images],
  );
  const [imgIndex, setImgIndex] = useState(0);
  const maxIndex = Math.max(carouselImages.length - 1, 0);
  const currentIndex = Math.min(imgIndex, maxIndex);

  useEffect(() => {
    if (carouselImages.length <= 1) {
      return;
    }

    const intervalRef = setInterval(() => {
      setImgIndex((pv) => {
        if (pv >= carouselImages.length - 1) {
          return 0;
        }
        return pv + 1;
      });
    }, autoDelayMs);

    return () => clearInterval(intervalRef);
  }, [autoDelayMs, carouselImages.length]);

  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const x = info.offset.x;

    if (x <= -DRAG_BUFFER && currentIndex < carouselImages.length - 1) {
      setImgIndex((pv) => pv + 1);
    } else if (x >= DRAG_BUFFER && currentIndex > 0) {
      setImgIndex((pv) => pv - 1);
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
        <Images images={carouselImages} imgIndex={currentIndex} />
      </motion.div>
        {dots && <Dots images={carouselImages} imgIndex={currentIndex} setImgIndex={setImgIndex} />}
    </div>
  );
}

type ImagesProps = {
  images: CarouselImage[];
  imgIndex: number;
};

function Images({ images, imgIndex }: ImagesProps) {
  return (
    <>
      {images.map((image, idx) => {
        return (
          <motion.div
            key={image.id}
            animate={{
              scale: imgIndex === idx ? 0.95 : 0.85,
            }}
            transition={SPRING_OPTIONS}
            className="aspect-video w-full min-w-full shrink-0 rounded-xl"
          >
            <img
              src={image.src}
              srcSet={image.srcSet}
              sizes={image.sizes}
              alt={image.title ?? "Imagen"}
              className="h-full w-full rounded-xl object-cover shadow-2xl"
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
  setImgIndex: React.Dispatch<React.SetStateAction<number>>;
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

