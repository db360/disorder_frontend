import { useRef, useState, useEffect } from 'react';
import Matter from 'matter-js';
import MagnetButton from './MagnetButton';

interface FallingTextProps {
  text?: string;
  highlightWords?: string[];
  highlightClass?: string;
  trigger?: 'auto' | 'scroll' | 'click' | 'hover' | 'button';
  backgroundColor?: string;
  wireframes?: boolean;
  gravity?: number;
  mouseConstraintStiffness?: number;
  fontSize?: string;
  triggerLabel?: string;
  containerHeightClass?: string;
  textTopClass?: string;
}

const normalizeWord = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');
};

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const FallingText: React.FC<FallingTextProps> = ({
  text = '',
  highlightWords = [],
  highlightClass = 'text-primary-700 dark:text-primary-400 scale-125 font-bold',
  trigger = 'auto',
  backgroundColor = 'transparent',
  wireframes = false,
  gravity = 1,
  mouseConstraintStiffness = 0.2,
  fontSize = '1rem',
  triggerLabel = 'Disorder',
  containerHeightClass = 'min-h-[18rem]',
  textTopClass = 'pt-3'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [effectStarted, setEffectStarted] = useState(trigger === 'auto');
  const [animationRunId, setAnimationRunId] = useState(0);

  const fontSizeClassMap: Record<string, string> = {
    '0.875rem': 'text-sm',
    '1rem': 'text-base',
    '1.125rem': 'text-lg',
    '1.25rem': 'text-xl',
    '1.5rem': 'text-2xl',
    '2rem': 'text-3xl'
  };

  const fontSizeClass = fontSizeClassMap[fontSize] ?? 'text-base';

  useEffect(() => {
    if (!textRef.current) return;
    const normalizedHighlights = highlightWords.map(normalizeWord).filter(Boolean);
    const words = text.split(' ');

    const newHTML = words
      .map(word => {
        const normalizedWord = normalizeWord(word);
        const isHighlighted = normalizedHighlights.some((highlight) => {
          return normalizedWord === highlight || normalizedWord.startsWith(highlight);
        });
        const baseClasses = 'inline-block mx-0.5 select-none';
        const highlightClasses = 'font-bold';
        const composedClass = isHighlighted
          ? `${baseClasses} ${highlightClasses} ${highlightClass}`
          : baseClasses;

        return `<span
          class="${composedClass}"
        >
          ${escapeHtml(word)}
        </span>`;
      })
      .join(' ');

    textRef.current.innerHTML = newHTML;
  }, [text, highlightWords, highlightClass, animationRunId]);

  useEffect(() => {
    if (trigger === 'scroll' && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setEffectStarted(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [trigger]);

  useEffect(() => {
    if (!effectStarted) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } = Matter;

    if (!containerRef.current || !canvasContainerRef.current) return;
    const canvasHost = canvasContainerRef.current;

    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    if (width <= 0 || height <= 0) return;

    const engine = Engine.create();
    engine.world.gravity.y = gravity;

    const render = Render.create({
      element: canvasHost,
      engine,
      options: {
        width,
        height,
        background: backgroundColor,
        wireframes
      }
    });

    const boundaryOptions = {
      isStatic: true,
      render: { fillStyle: 'transparent' }
    };
    const floor = Bodies.rectangle(width / 2, height + 25, width, 50, boundaryOptions);
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions);
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions);
    const ceiling = Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions);

    if (!textRef.current) return;
    const wordSpans = textRef.current.querySelectorAll('span');
    const wordBodies = [...wordSpans].map(elem => {
      const rect = elem.getBoundingClientRect();

      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;

      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        render: { fillStyle: 'transparent' },
        restitution: 0.8,
        frictionAir: 0.01,
        friction: 0.2
      });
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 5,
        y: 0
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

      return { elem, body };
    });

    wordBodies.forEach(({ elem, body }) => {
      elem.style.position = 'absolute';
      elem.style.left = `${body.position.x - body.bounds.max.x + body.bounds.min.x / 2}px`;
      elem.style.top = `${body.position.y - body.bounds.max.y + body.bounds.min.y / 2}px`;
      elem.style.transform = 'none';
    });

    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: mouseConstraintStiffness,
        render: { visible: false }
      }
    });
    render.mouse = mouse;

    World.add(engine.world, [floor, leftWall, rightWall, ceiling, mouseConstraint, ...wordBodies.map(wb => wb.body)]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    const updateLoop = () => {
      wordBodies.forEach(({ body, elem }) => {
        const { x, y } = body.position;
        elem.style.left = `${x}px`;
        elem.style.top = `${y}px`;
        elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };
    updateLoop();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas && canvasHost.contains(render.canvas)) {
        canvasHost.removeChild(render.canvas);
      }
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [effectStarted, gravity, wireframes, backgroundColor, mouseConstraintStiffness]);

  const handleTrigger = () => {
    if (!effectStarted) {
      setEffectStarted(true);
    }
  };

  const handleReplay = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setEffectStarted(false);
    setAnimationRunId((prev) => prev + 1);

    if (trigger === 'auto') {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEffectStarted(true);
        });
      });
    }
  };

  const isClickableContainerTrigger = trigger === 'click' || trigger === 'hover';

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className={`relative z-1 w-full text-center overflow-visible text-primary-100 ${containerHeightClass} ${textTopClass} ${isClickableContainerTrigger ? 'cursor-pointer' : ''}`}
        onClick={trigger === 'click' ? handleTrigger : undefined}
        onMouseEnter={trigger === 'hover' ? handleTrigger : undefined}
      >
        <button
          type="button"
          onClick={handleReplay}
          aria-label="Rehacer animación"
          title="Rehacer"
          className="absolute -top-3 -left-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-700/60 bg-primary-100/70 text-primary-800 transition-colors hover:bg-primary-100 dark:border-primary-200/60 dark:bg-primary-900/70 dark:text-primary-100 dark:hover:bg-primary-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>

        <div
          ref={textRef}
          className={`inline-block leading-[1.4] ${fontSizeClass}`}
        />

        <div className="absolute inset-0 z-0 pointer-events-none" ref={canvasContainerRef} />
      </div>

      {trigger === 'button' && (
        <div className="mt-4 flex justify-center">
          <MagnetButton
            type="button"
            onClick={handleTrigger}
            disabled={effectStarted}
            innerClassName="inline-flex h-10 items-center justify-center rounded-full border border-primary-700 px-6 font-beatstreet leading-none text-primary-700 transition-colors hover:cursor-pointer hover:bg-primary-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-primary-100 dark:text-primary-100 dark:hover:bg-primary-200/10"
          >
            <p>{triggerLabel}</p>
          </MagnetButton>
        </div>
      )}
    </div>
  );
};

export default FallingText;
