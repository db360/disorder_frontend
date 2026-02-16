import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

export type GalleryImage = {
  id: string | number;
  src: string;
  srcSet?: string;
  sizes?: string;
  title: string;
  description?: string;
};

const shuffleImages = (images: GalleryImage[]): GalleryImage[] => {
  const shuffled = [...images];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

export default function ImageGallery({ images }: { images?: GalleryImage[] }) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const galleryImages = useMemo(
    () => (images && images.length > 0 ? shuffleImages(images) : []),
    [images],
  );

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
    setIsLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
    setIsLightboxOpen(false);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isLightboxOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLightboxOpen]);

  const goToNext = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = galleryImages.findIndex((img) => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    setSelectedImage(galleryImages[nextIndex]);
  }, [selectedImage, galleryImages]);

  const goToPrev = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = galleryImages.findIndex((img) => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    setSelectedImage(galleryImages[prevIndex]);
  }, [selectedImage, galleryImages]);

  useEffect(() => {
    const handleKeyDown = (e:KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === "Escape") {
          closeLightbox();
        }
        if (e.key === "ArrowRight") {
          goToNext();
        }
        if (e.key === "ArrowLeft") {
          goToPrev();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, selectedImage, goToNext, goToPrev, closeLightbox]);

  return (
    <div className="min-h-[calc(100vh-var(--nav-height))] py-12 px-4 sm:px-6 lg:px-8 text-primary-100">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {galleryImages.map((image, index) => {
            const row = Math.floor(index / 2);
            const posInRow = index % 2;

            let spanClass = "";
            if (row % 2 === 0) {
              spanClass = posInRow === 0 ? "lg:col-span-2" : "lg:col-span-1";
            } else {
              spanClass = posInRow === 0 ? "lg:col-span-1" : "lg:col-span-2";
            }

            return (
              <motion.div
                className={`relative cursor-pointer group ${spanClass}`}
                onClick={() => openLightbox(image)}
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  className="w-full h-64 object-cover rounded-lg"
                  src={image.src}
                  srcSet={image.srcSet}
                  sizes={image.sizes}
                  alt={image.title}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 group-hover:bg-primary/60 duration-200 flex items-end">
                  <div className="p-4 text-white translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-200 ">
                    <h3 className="font-semibold text-lg">{image.title}</h3>
                    <p className="text-sm">{image.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        <AnimatePresence>
          {isLightboxOpen && selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-primary-600 z-50 flex items-center justify-center p-4"
            >
              <div className="relative bg-primary-900 rounded-xl overflow-hidden max-w-6xl w-full">
                <button
                  className="absolute top-4 right-4 z-10 bg-primary-900 hover:bg-primary-700 text-white w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
                  onClick={closeLightbox}
                >
                  ×
                </button>
                <div className="relative">
                  <img
                    className="w-full h-[70vh] md:h-[75vh] object-cover"
                    src={selectedImage.src}
                    srcSet={selectedImage.srcSet}
                    sizes={selectedImage.sizes ?? "100vw"}
                    alt={selectedImage.title}
                  />
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="absolute left-0 top-0 h-full w-full md:w-96 bg-linear-to-r from-black/85 via-black/50 to-transparent p-6 text-white drop-shadow flex flex-col justify-between pointer-events-auto">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">
                          {selectedImage.title}
                        </h2>
                        <p className="text-white/90">
                          {selectedImage.description}
                        </p>
                      </div>
                      <div />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 z-10 rounded-full bg-primary-900/80 px-3 py-1 text-sm text-slate-200">
                    {galleryImages.findIndex(
                      (img) => img.id === selectedImage.id
                    ) + 1}{" "}
                    / {galleryImages.length}
                  </div>
                </div>
                <button
                  onClick={goToPrev}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-primary-900 hover:bg-primary-700 text-white w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
                >
                  &#10094;
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-primary-900 hover:bg-primary-700 text-white w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
                >
                  &#10095;
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

