import { useEffect, useRef, useState } from "react";

type ScrollTextProps = {
  text: string;
  textSize?: number;
  textY?: number;
  className?: string;
  containerClassName?: string;
};

export default function ScreenFitText({
  text,
  textSize,
  textY = 40,
  className,
  containerClassName,
}: ScrollTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const maskTextRef = useRef<SVGTextElement>(null);
  const glowTextRef = useRef<SVGTextElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const resizeText = () => {
    const container = containerRef.current;
    const text = textRef.current;
    const maskText = maskTextRef.current;
    const glowText = glowTextRef.current;

    if (!container || !text || !maskText || !glowText) {
      return;
    }

    if (textSize) {
      const sizeValue = `${textSize}px`;
      text.style.fontSize = sizeValue;
      maskText.style.fontSize = sizeValue;
      glowText.style.fontSize = sizeValue;
      return;
    }

    const containerWidth = container.getBoundingClientRect().width;
    let min = 1;
    let max = 2500;

    while (min <= max) {
      const mid = Math.floor((min + max) / 2);
      text.style.fontSize = mid + "px";

      const textWidth = text.getBBox().width;

      if (textWidth <= containerWidth) {
        min = mid + 1;
      } else {
        max = mid - 1;
      }
    }

    text.style.fontSize = max + "px";
    maskText.style.fontSize = max + "px";
    glowText.style.fontSize = max + "px";
  };
  useEffect(() => {
    resizeText();

    if (!textSize) {
      window.addEventListener("resize", resizeText);
    }

    return () => {
      window.removeEventListener("resize", resizeText);
    };
  }, [textSize]);

  return (
    <div
      className={`relative w-full overflow-hidden ${className ?? containerClassName ?? "h-screen"}`}
      ref={containerRef}
    >
      <svg
        className="absolute bottom-0 left-0 h-full w-full text-white"
        role="img"
        aria-label={text}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <mask
            id="scroll-text-mask"
            x="0"
            y="0"
            width="100%"
            height="100%"
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="100%" height="100%" fill="black" />
            <text
              ref={maskTextRef}
              x="50%"
              y={`${textY}%`}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-beatstreet uppercase"
              fill="white"
            >
              {text}
            </text>
          </mask>
        </defs>
        <image
          href={`${(import.meta.env.VITE_WORDPRESS_URL ?? "").replace(/\/$/, "")}/wp-content/uploads/2026/02/19.jpg`}
          width="100%"
          height="100%"
          x="0%"
          y="-30%"
          preserveAspectRatio="xMidYMid slice"
          mask="url(#scroll-text-mask)"
          pointerEvents="none"
        />
        <text
          ref={glowTextRef}
          x="50%"
          y={`${textY}%`}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`font-beatstreet uppercase transition-opacity duration-300 cursor-default select-none ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="6"
          filter="url(#text-glow)"
          pointerEvents="none"
        >
          {text}
        </text>
        <text
          ref={textRef}
          x="50%"
          y={`${textY}%`}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-beatstreet uppercase cursor-default select-none"
          fill="transparent"
          stroke="#FDD816"
          strokeWidth="2"
          paintOrder="stroke"
          pointerEvents="visibleStroke"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {text}
        </text>
      </svg>
    </div>
  );
}
