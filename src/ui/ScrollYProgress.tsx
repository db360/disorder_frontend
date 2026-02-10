import { useScroll, motion } from "framer-motion";

export default function ScrollYProgress() {
    const { scrollYProgress } = useScroll();

    return (
        <motion.div
            className="scroll-progress fixed top-0 left-0 z-99 h-2 w-full origin-left bg-primary-400 transition-colors"
            style={{ scaleX: scrollYProgress }}
        />
    );
}