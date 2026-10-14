import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import './ScrollProgress.css';

/** The visitor's progress through the museum as a gold hairline pinned to
 * the top of the viewport — Animate UI's Scroll Progress, thinned to match
 * the site's GoldRule language. Spring-smoothed so fast scrolls glide. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}
