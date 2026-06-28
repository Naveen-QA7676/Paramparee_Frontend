import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const offset: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 64 },
  down: { y: -64 },
  left: { x: 64 },
  right: { x: -64 },
  none: {},
};

interface RevealProps {
  children: ReactNode;
  /** Slide direction the content enters from. Defaults to "up". */
  direction?: Direction;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Animation duration in seconds. */
  duration?: number;
  /** Starting 3D tilt (degrees) the panel rotates up from. Set 0 to disable. */
  tilt?: number;
  className?: string;
}

/**
 * Scroll-triggered 3D reveal. The first time the content enters the viewport it
 * rises and rotates up from a tilted, slightly-shrunk state into place — giving
 * each section a "3D screen" entrance. Purely presentational: it never changes
 * layout or behavior, and degrades to a plain fade when the user has
 * `prefers-reduced-motion` enabled.
 */
export const Reveal = ({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  tilt = 14,
  className,
}: RevealProps) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const variants: Variants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={variants}
        transition={{ duration: 0.5, delay }}
      >
        {children}
      </motion.div>
    );
  }

  const move = offset[direction];
  const variants: Variants = {
    hidden: { opacity: 0, rotateX: tilt, scale: 0.94, ...move },
    visible: { opacity: 1, rotateX: 0, scale: 1, x: 0, y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={variants}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformPerspective: 1200, transformOrigin: "center bottom" }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
