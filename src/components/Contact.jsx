import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useMuseum } from '../context/MuseumContext';
import { isRealLink } from '../lib/assets';
import Magnetic from './anim/Magnetic';
import './Contact.css';

export default function Contact() {
  const { settings } = useMuseum();
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section id="contact" className="contact-section" ref={ref}>
      <div className="container">
        <motion.div 
          className="contact-inner"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="contact-content">
            <h2 className="contact-title serif">{t('contact.title')}</h2>
            <p className="contact-desc">
              {t('contact.desc')}
            </p>
            
            <div className="contact-actions">
              {settings.email && (
                <Magnetic>
                  <a href={`mailto:${settings.email}`} className="contact-btn primary">
                    <span className="mono">{t('contact.getInTouch')}</span>
                  </a>
                </Magnetic>
              )}
              {isRealLink(settings.cvLink) && (
                <Magnetic>
                  <a
                    href={settings.cvLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-btn secondary"
                  >
                    <span className="mono">{t('contact.downloadCv')}</span>
                  </a>
                </Magnetic>
              )}
            </div>
          </div>

          <div className="contact-visual">
            <div className="contact-circle"></div>
            <div className="contact-circle-inner"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
