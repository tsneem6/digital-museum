import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { MotionConfig } from 'framer-motion';
import { MuseumProvider, useMuseum } from './context/MuseumContext';
import Splash, { shouldShowSplash } from './components/Splash';
import Cursor from './components/Cursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import NowBlock from './components/NowBlock';
import FeaturedBanner from './components/FeaturedBanner';
import ProjectParade from './components/ProjectParade';
import Gallery from './components/Gallery';
import Timeline from './components/Timeline';
import Volunteering from './components/Volunteering';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import GuidedTour from './components/GuidedTour';
import HelloKitty from './components/HelloKitty';
import ScrollProgress from './components/anim/ScrollProgress';
import './App.css';

// Loaded only when needed, so the first visit downloads as little as possible:
//  · Guestbook pulls in supabase-js and sits at the very bottom of the page.
//  · ProjectModal pulls in the Markdown renderer; it loads on the first click.
//  · The editor is owner-only; visitors never download it.
const Guestbook = lazy(() => import('./components/Guestbook'));
const ProjectModal = lazy(() => import('./components/ProjectModal'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const EditDock = lazy(() => import('./components/admin/EditDock'));

// Warm the popup chunk while the browser is idle, so the first click on a
// project opens instantly instead of waiting on the network.
const prefetchModal = () => import('./components/ProjectModal');

function MuseumApp() {
  const { adminPanel, viewingProject, isAdmin } = useMuseum();

  // Latches true on first use — from then on these stay mounted so their
  // exit animations can play.
  const [editorTouched, setEditorTouched] = useState(false);
  const [modalTouched, setModalTouched] = useState(false);
  useEffect(() => { if (adminPanel) setEditorTouched(true); }, [adminPanel]);
  useEffect(() => { if (viewingProject) setModalTouched(true); }, [viewingProject]);

  const [splash, setSplash] = useState(shouldShowSplash);
  const [revealed, setRevealed] = useState(!splash);
  const handleReveal = useCallback(() => setRevealed(true), []);
  const handleDone = useCallback(() => setSplash(false), []);

  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 2500));
    const id = idle(prefetchModal);
    return () => (window.cancelIdleCallback || clearTimeout)(id);
  }, []);

  return (
    <>
      <Cursor />
      {splash && <Splash onReveal={handleReveal} onDone={handleDone} />}
      <div className="site-wrapper">
        <ScrollProgress />
        <Navbar revealed={revealed} />
        <main>
          <Hero revealed={revealed} />
          <NowBlock />
          <FeaturedBanner />
          <ProjectParade />
          <Gallery />
          <Timeline />
          <Volunteering />
          <Testimonials />
          <Contact />
          <Suspense fallback={null}>
            <Guestbook />
          </Suspense>
        </main>
        <Footer />
      </div>
      {modalTouched && (
        <Suspense fallback={null}>
          <ProjectModal />
        </Suspense>
      )}
      {editorTouched && (
        <Suspense fallback={null}>
          <AdminPanel />
        </Suspense>
      )}
      {isAdmin && !adminPanel && (
        <Suspense fallback={null}>
          <EditDock />
        </Suspense>
      )}
      <GuidedTour />
      <HelloKitty />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <MuseumProvider>
        <MuseumApp />
      </MuseumProvider>
    </MotionConfig>
  );
}
