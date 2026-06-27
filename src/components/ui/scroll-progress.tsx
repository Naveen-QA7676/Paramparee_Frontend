import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Slim gold bar fixed to the top of the viewport that tracks page scroll
 * progress. Mounted once globally so it appears on every route.
 */
export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[200] h-1 origin-left bg-gradient-to-r from-gold via-gold to-maroon"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgress;
