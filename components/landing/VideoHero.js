import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CTA_INTERNAL_HREF } from '../../lib/seo';

// Replace /videos/promo.mp4 with the real file in public/videos/.
// VIDEO_SRC and POSTER_SRC are kept as relative paths so the public/ folder
// is the single source of truth — no env-var plumbing needed.
const VIDEO_SRC = '/videos/promo.mp4';
const POSTER_SRC = '/images/video-poster.jpg';

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72c0 .79.87 1.27 1.54.85l10.79-6.86a1 1 0 0 0 0-1.7L9.54 4.29C8.87 3.87 8 4.35 8 5.14Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="cta__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

export default function VideoHero() {
  const videoRef = useRef(null);
  const [isUserPlaying, setIsUserPlaying] = useState(false);

  // Kick off muted autoplay on mount. Browsers only allow autoplay when muted.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { /* autoplay may be blocked; poster + Play button still work */ });
    }
  }, []);

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    // Spec: video must RESTART from the beginning with sound on — not resume.
    v.pause();
    v.currentTime = 0;
    v.muted = false;
    v.volume = 1;
    const p = v.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { /* ignore; UI state already updated */ });
    }
    setIsUserPlaying(true);
  };

  return (
    <section className="hero" aria-label="Intro">
      <video
        ref={videoRef}
        className="hero__video"
        src={VIDEO_SRC}
        poster={POSTER_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="hero__video-fallback" aria-hidden="true" />
      <div className="hero__overlay" aria-hidden="true" />

      <div className="container hero__content">
        <span className="hero__eyebrow">Private Trading Desk</span>
        <h1 className="hero__title">
          The market rewards <em>discipline</em>.<br />
          We trade it every day.
        </h1>
        <p className="hero__subtitle">
          Institutional-grade signals, real-time commentary and a daily live review — delivered straight to your Telegram.
        </p>

        <Link href={CTA_INTERNAL_HREF}>
          <a className="cta cta--lg" data-testid="cta-primary">
            Перейти в Telegram
            <ArrowIcon />
          </a>
        </Link>
      </div>

      {!isUserPlaying && (
        <div className="hero__play-wrap">
          <button
            type="button"
            className="hero__play"
            onClick={handlePlay}
            aria-label="Play video with sound"
          >
            <PlayIcon />
          </button>
        </div>
      )}
    </section>
  );
}
