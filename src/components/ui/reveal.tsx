import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const offset: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 32 },
  down: { y: -32 },
  left: { x: 32 },
  right: { x: -32 },
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
  className?: string;
}

/**
 * Scroll-triggered reveal wrapper. Fades and slides its children into view the
 * first time they enter the viewport. Purely presentational — it never alters
 * layout or behavior, and falls back to a plain fade when the user has
 * `prefers-reduced-motion` enabled.
 */
export const Reveal = ({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className,
}: RevealProps) => {
  const reduceMotion = useReducedMotion();
  const move = reduceMotion ? {} : offset[direction];

  const variants: Variants = {
    hidden: { opacity: 0, ...move },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
