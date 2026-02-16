import { motion } from "framer-motion";

type FlipLinkProps = {
  children: string;
  href: string;
};

const DURATION = 0.25;
const STAGGER = 0.025;

function FlipLink({ children, href }: FlipLinkProps) {
  return (
    <motion.a
      initial="initial"
      whileHover="hovered"
      href={href}
      target="_blank"
      rel="noreferrer"
      className="relative block overflow-hidden whitespace-nowrap text-4xl font-black uppercase sm:text-3xl md:text-4xl lg:text-6xl leading-loose transition-colors duration-200 hover:text-primary-900"
    >
      <div>
        {children.split("").map((letter, index) => (
          <motion.span
            variants={{
              initial: {
                y: 0,
              },
              hovered: {
                y: "-100%",
              },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * index,
            }}
            className="inline-block"
            key={`${children}-top-${index}`}
          >
            {letter}
          </motion.span>
        ))}
      </div>

      <div className="absolute inset-0">
        {children.split("").map((letter, index) => (
          <motion.span
            variants={{
              initial: {
                y: "100%",
              },
              hovered: {
                y: 0,
              },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * index,
            }}
            className="inline-block"
            key={`${children}-bottom-${index}`}
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </motion.a>
  );
}

export default function RevealLinks() {
  return (
    <section className="grid place-content-center gap-2 px-8 py-48 text-primary-100 -translate-x-4">
      <FlipLink href="https://share.google/FgykKKxEn3jMGE370">Google</FlipLink>
      <FlipLink href="https://www.linkedin.com">LinkedIn</FlipLink>
      <FlipLink href="https://www.facebook.com">Facebook</FlipLink>
      <FlipLink href="https://www.instagram.com">Instagram</FlipLink>
    </section>
  );
}
