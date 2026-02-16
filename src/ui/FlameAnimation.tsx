import { useCallback, useEffect, useRef, useState } from "react";

type FlameAnimationProps = {
  spriteSheetUrl: string;
  frameWidth?: number;
  frameHeight?: number;
  columns?: number;
  rows?: number;
  fps?: number;
  autoPlay?: boolean;
  loop?: boolean;
  centerFrames?: boolean;
  frameOffsetY?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function FlameAnimation({
  spriteSheetUrl,
  frameWidth,
  frameHeight,
  columns = 4,
  rows = 4,
  fps = 12,
  autoPlay = true,
  loop = true,
  centerFrames = true,
  frameOffsetY = 0,
  className,
  style,
}: FlameAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(fps);
  const [resolvedFrameWidth, setResolvedFrameWidth] = useState(frameWidth ?? 0);
  const [resolvedFrameHeight, setResolvedFrameHeight] = useState(frameHeight ?? 0);
  const [frameBounds, setFrameBounds] = useState<
    Array<{ minX: number; minY: number; maxX: number; maxY: number }>
  >([]);
  const [frameCentroids, setFrameCentroids] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const totalFrames = columns * rows;

  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img) {
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      const col = frameIndex % columns;
      const row = Math.floor(frameIndex / columns);

      ctx.clearRect(0, 0, resolvedFrameWidth, resolvedFrameHeight);

      if (centerFrames && frameBounds[frameIndex]) {
        const bounds = frameBounds[frameIndex];
        const contentWidth = bounds.maxX - bounds.minX + 1;
        const contentHeight = bounds.maxY - bounds.minY + 1;
        const centroid = frameCentroids[frameIndex];
        const fallbackCenterX = bounds.minX + contentWidth / 2;
        const fallbackCenterY = bounds.minY + contentHeight / 2;
        const centerX = centroid ? centroid.x : fallbackCenterX;
        const centerY = centroid ? centroid.y : fallbackCenterY;
        const dx = Math.floor(resolvedFrameWidth / 2 - (centerX - bounds.minX));
        const dy = Math.floor(resolvedFrameHeight / 2 - (centerY - bounds.minY) + frameOffsetY);

        ctx.drawImage(
          img,
          col * resolvedFrameWidth + bounds.minX,
          row * resolvedFrameHeight + bounds.minY,
          contentWidth,
          contentHeight,
          dx,
          dy,
          contentWidth,
          contentHeight,
        );
        return;
      }

      ctx.drawImage(
        img,
        col * resolvedFrameWidth,
        row * resolvedFrameHeight,
        resolvedFrameWidth,
        resolvedFrameHeight,
        0,
        frameOffsetY,
        resolvedFrameWidth,
        resolvedFrameHeight,
      );
    },
    [
      centerFrames,
      columns,
      frameBounds,
      frameCentroids,
      frameOffsetY,
      resolvedFrameHeight,
      resolvedFrameWidth,
    ],
  );

  useEffect(() => {
    const img = new Image();
    img.src = spriteSheetUrl;

    const handleLoad = () => {
      imageRef.current = img;
      if (!frameWidth || !frameHeight) {
        setResolvedFrameWidth(Math.floor(img.naturalWidth / columns));
        setResolvedFrameHeight(Math.floor(img.naturalHeight / rows));
      }
      drawFrame(frameRef.current);
    };

    img.addEventListener("load", handleLoad);

    return () => {
      img.removeEventListener("load", handleLoad);
    };
  }, [spriteSheetUrl, drawFrame, columns, rows, frameWidth, frameHeight]);

  useEffect(() => {
    if (!centerFrames) {
      setFrameBounds([]);
      setFrameCentroids([]);
      return;
    }

    const img = imageRef.current;
    if (!img || !resolvedFrameWidth || !resolvedFrameHeight) {
      return;
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = resolvedFrameWidth;
    offscreen.height = resolvedFrameHeight;
    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      return;
    }

    const bounds: Array<{ minX: number; minY: number; maxX: number; maxY: number }> = [];
    const centroids: Array<{ x: number; y: number }> = [];

    for (let index = 0; index < totalFrames; index += 1) {
      const col = index % columns;
      const row = Math.floor(index / columns);

      ctx.clearRect(0, 0, resolvedFrameWidth, resolvedFrameHeight);
      ctx.drawImage(
        img,
        col * resolvedFrameWidth,
        row * resolvedFrameHeight,
        resolvedFrameWidth,
        resolvedFrameHeight,
        0,
        0,
        resolvedFrameWidth,
        resolvedFrameHeight,
      );

      const imageData = ctx.getImageData(0, 0, resolvedFrameWidth, resolvedFrameHeight);
      const data = imageData.data;
      let minX = resolvedFrameWidth;
      let minY = resolvedFrameHeight;
      let maxX = -1;
      let maxY = -1;
      let sumX = 0;
      let sumY = 0;
      let sumA = 0;

      for (let y = 0; y < resolvedFrameHeight; y += 1) {
        for (let x = 0; x < resolvedFrameWidth; x += 1) {
          const alpha = data[(y * resolvedFrameWidth + x) * 4 + 3];
          if (alpha > 0) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            sumX += x * alpha;
            sumY += y * alpha;
            sumA += alpha;
          }
        }
      }

      if (maxX < 0 || maxY < 0) {
        bounds.push({
          minX: 0,
          minY: 0,
          maxX: resolvedFrameWidth - 1,
          maxY: resolvedFrameHeight - 1,
        });
        centroids.push({
          x: resolvedFrameWidth / 2,
          y: resolvedFrameHeight / 2,
        });
      } else {
        bounds.push({ minX, minY, maxX, maxY });
        if (sumA > 0) {
          centroids.push({ x: sumX / sumA, y: sumY / sumA });
        } else {
          centroids.push({
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2,
          });
        }
      }
    }

    setFrameBounds(bounds);
    setFrameCentroids(centroids);
  }, [centerFrames, columns, resolvedFrameHeight, resolvedFrameWidth, rows, totalFrames]);

  useEffect(() => {
    frameRef.current = frame;
    drawFrame(frame);
  }, [frame, drawFrame]);

  useEffect(() => {
    if (!isPlaying) {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const tick = () => {
      const nextFrame = frameRef.current + 1;
      if (nextFrame >= totalFrames) {
        if (!loop) {
          setIsPlaying(false);
          return;
        }
        setFrame(0);
      } else {
        setFrame(nextFrame);
      }

      timeoutRef.current = window.setTimeout(tick, 1000 / speed);
    };

    timeoutRef.current = window.setTimeout(tick, 1000 / speed);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isPlaying, loop, speed, totalFrames]);

  return (
    <canvas
      ref={canvasRef}
      width={resolvedFrameWidth || frameWidth || 1}
      height={resolvedFrameHeight || frameHeight || 1}
      className={className ?? "block"}
      style={{ filter: "drop-shadow(0 0 12px rgba(255, 140, 64, 0.45))", ...style }}
    />
  );
};
