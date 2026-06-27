import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

interface MagneticProps {
  children: ReactNode;
  /** How strongly the element follows the cursor (0..1). */
  strength?: number;
  className?: string;
}

/**
 * Makes its child subtly "magnetically" follow the cursor while hovered, then
 * springs back on leave. Renders an inline-block wrapper so it can hug buttons
 * and links without changing layout. No-ops under prefers-reduced-motion.
 */
export const Magnetic = ({ children, strength = 0.35, className }: MagneticProps) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.3 });

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  if (reduceMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy, display: "inline-block" }}
    >
      {children}
    </motion.span>
  );
};

export default Magnetic;
