import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const interactive = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Children gently pull toward the pointer while it's over them, then
 * spring home — Animate UI's Magnetic effect. Subtle by design (default
 * ±6px at the edges); wraps buttons/links without altering their own
 * hover styling. Inert on touch devices and under reduced motion. */
export default function Magnetic({ children, strength = 0.25, className = '', style }) {
  const ref = useRef(null);
  const x = useSpring(useMotionValue(0), { stiffness: 160, damping: 16, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 160, damping: 16, mass: 0.4 });

  const onMove = (e) => {
    if (!interactive() || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: 'inline-block', x, y, ...style }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.span>
  );
}
