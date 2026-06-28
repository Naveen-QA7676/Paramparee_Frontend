import { motion, useReducedMotion, type Variants } from "framer-motion";

interface TextRevealProps {
  text: string;
  className?: string;
  /** Delay before the stagger starts, in seconds. */
  delay?: number;
  /** Per-word stagger interval, in seconds. */
  stagger?: number;
}

const container = (delay: number, stagger: number): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

const word: Variants = {
  hidden: { opacity: 0, y: "0.7em", rotateX: 90 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Reveals text word-by-word with a 3D flip-up, the first time it scrolls into
 * view. Falls back to plain text under prefers-reduced-motion. Renders an
 * inline-block wrapper so it slots into any heading without altering layout.
 */
export const TextReveal = ({ text, className, delay = 0, stagger = 0.08 }: TextRevealProps) => {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <span className={className}>{text}</span>;
  }

  const words = text.split(" ");

  return (
    <motion.span
      className={className}
      variants={container(delay, stagger)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      style={{ display: "inline-block", perspective: 600 }}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          variants={word}
          style={{ display: "inline-block", transformOrigin: "bottom" }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default TextReveal;
