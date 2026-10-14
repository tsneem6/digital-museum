import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useMuseum } from '../context/MuseumContext';
import ShimmeringText from './anim/ShimmeringText';
import MotionCarousel from './anim/MotionCarousel';
import './Testimonials.css';

export default function Testimonials() {
  const { testimonials } = useMuseum();
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="testimonials-section" ref={ref}>
      <div className="container">
        <motion.div
          className="testimonials-header"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-label"><ShimmeringText text={t('testimonials.eyebrow')} /></div>
          <h2 className="testimonials-title serif">{t('testimonials.title')}</h2>
        </motion.div>

        {/* ≤3 voices sit side by side like wall plaques; more than that
            rotates as a carousel so no endorsement is buried below the fold. */}
        {testimonials.length > 3 ? (
          <MotionCarousel className="testimonials-carousel">
            {testimonials.map((item) => (
              <div key={item.id} className="testimonials-carousel-slide">
                <TestimonialCard item={item} index={0} inView={inView} />
              </div>
            ))}
          </MotionCarousel>
        ) : (
          <div className="testimonials-grid">
            {testimonials.map((item, i) => (
              <TestimonialCard key={item.id} item={item} index={i} inView={inView} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialCard({ item, index, inView }) {
  return (
    <motion.figure
      className="testimonial-card"
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 * index }}
    >
      <span className="testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
      <blockquote className="testimonial-quote">{item.quote}</blockquote>
      <figcaption className="testimonial-attribution">
        {item.avatarUrl ? (
          <img src={item.avatarUrl} alt="" className="testimonial-avatar" loading="lazy" decoding="async" />
        ) : (
          <span className="testimonial-avatar testimonial-avatar-fallback mono">
            {(item.name || '?').charAt(0).toUpperCase()}
          </span>
        )}
        <span className="testimonial-who">
          <span className="testimonial-name">{item.name}</span>
          {item.role && <span className="testimonial-role mono">{item.role}</span>}
        </span>
      </figcaption>
    </motion.figure>
  );
}
