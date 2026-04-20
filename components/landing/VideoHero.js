import React, { useCallback, useEffect, useRef, useState } from 'react';

// Short, copyright-safe test video hosted on YouTube (Google's "Me at the zoo",
// the very first YouTube upload, ~19s, embeddable). Swap TEST_VIDEO_ID for the
// real promo clip when you have one.
const TEST_VIDEO_ID = 'jNQXAC9IVRw';
const YT_API_SRC = 'https://www.youtube.com/iframe_api';

// YouTube player state codes we care about.
const YT_STATE_PLAYING = 1;
const YT_STATE_PAUSED = 2;

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72c0 .79.87 1.27 1.54.85l10.79-6.86a1 1 0 0 0 0-1.7L9.54 4.29C8.87 3.87 8 4.35 8 5.14Z" />
    </svg>
  );
}

// Load the YouTube IFrame API once per page. Returns a promise that resolves
// with window.YT when the global is ready.
function loadYouTubeApi() {
  if (typeof window === 'undefined') return Promise.reject();
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);

  if (!window.__ytApiPromise) {
    window.__ytApiPromise = new Promise((resolve) => {
      const existing = document.querySelector(`script[src="${YT_API_SRC}"]`);
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        resolve(window.YT);
      };
      if (!existing) {
        const tag = document.createElement('script');
        tag.src = YT_API_SRC;
        tag.async = true;
        document.body.appendChild(tag);
      }
    });
  }
  return window.__ytApiPromise;
}

export default function VideoHero() {
  const heroRef = useRef(null);
  const mountRef = useRef(null);
  const playerRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  // hasActivated = user pressed the initial Play (unmuted + restart).
  // From that point on the Play control switches to pause/resume.
  const [hasActivated, setHasActivated] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [heroInView, setHeroInView] = useState(true);

  // Refs mirror state so the IntersectionObserver callback (stable across
  // renders) can read the latest values without stale closures.
  const hasActivatedRef = useRef(false);
  useEffect(() => { hasActivatedRef.current = hasActivated; }, [hasActivated]);
  const heroInViewRef = useRef(true);
  useEffect(() => { heroInViewRef.current = heroInView; }, [heroInView]);

  // Boot the YouTube player.
  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !mountRef.current) return;
      playerRef.current = new YT.Player(mountRef.current, {
        videoId: TEST_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          loop: 1,
          playlist: TEST_VIDEO_ID,
        },
        events: {
          onReady: (e) => {
            try {
              e.target.mute();
              // Only start playing if the hero is actually visible on load
              // (e.g. the user may have opened the page already scrolled to
              // a hash below the hero).
              if (heroInViewRef.current) e.target.playVideo();
            } catch (_) {}
            if (!cancelled) setIsReady(true);
          },
          onStateChange: (e) => {
            if (cancelled) return;
            if (e.data === YT_STATE_PLAYING) setIsPaused(false);
            else if (e.data === YT_STATE_PAUSED) setIsPaused(true);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try { playerRef.current.destroy(); } catch (_) {}
      }
    };
  }, []);

  // Initial Play click: unmute + restart from 0. The Play overlay unmounts
  // and from here on the pause/resume UX takes over.
  const handlePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.seekTo(0, true);
      p.unMute();
      if (typeof p.setVolume === 'function') p.setVolume(100);
      p.playVideo();
    } catch (_) {}
    setHasActivated(true);
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    const p = playerRef.current;
    if (!p || !hasActivatedRef.current) return;
    try {
      const state = typeof p.getPlayerState === 'function' ? p.getPlayerState() : null;
      if (state === YT_STATE_PLAYING) {
        p.pauseVideo();
      } else {
        p.playVideo();
      }
    } catch (_) {}
  }, []);

  // Click anywhere in the hero after activation → toggle pause.
  // Before activation the hero still receives the initial Play button's click;
  // this handler becomes relevant only once hasActivated flips to true.
  const handleHeroClick = useCallback((e) => {
    if (!hasActivatedRef.current) return;
    // Let any actual <a> / <button> inside the hero keep working normally.
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'a' || tag === 'button') return;
    togglePause();
  }, [togglePause]);

  // Spacebar → toggle pause, but ONLY while the hero is in the viewport and
  // the user isn't typing in a form control. Otherwise space keeps its
  // default behaviour (page scroll) and does not hijack the rest of the site.
  useEffect(() => {
    if (!heroInView || !hasActivated) return;
    const onKey = (e) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      const t = e.target;
      const tag = (t && t.tagName ? t.tagName : '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag) || (t && t.isContentEditable)) return;
      // Don't steal space from our own focused Play/CTA buttons — they
      // already handle it via click semantics.
      if (tag === 'button' || tag === 'a') return;
      e.preventDefault();
      togglePause();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [heroInView, hasActivated, togglePause]);

  // Pause automatically when the hero scrolls out of the viewport, both on
  // desktop and on mobile. When it scrolls back in we only resume
  // automatically if the video is still in its initial muted-autoplay
  // phase — once the user has activated (= audio on) we do NOT auto-resume
  // audio without a new user gesture.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        setHeroInView(visible);

        const p = playerRef.current;
        if (!p) return;
        try {
          if (!visible) {
            if (typeof p.getPlayerState === 'function' && p.getPlayerState() === YT_STATE_PLAYING) {
              p.pauseVideo();
            }
          } else if (!hasActivatedRef.current) {
            // still in muted autoplay phase → resume quietly
            p.playVideo();
          }
          // If the user has activated: do nothing on re-enter. The pause
          // indicator stays visible and the user taps/clicks or hits space
          // to resume.
        } catch (_) {}
      },
      { threshold: [0, 0.25, 0.6] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero"
      aria-label="Intro"
      onClick={handleHeroClick}
    >
      <div
        className={`hero__video-wrap${isReady ? ' hero__video-wrap--ready' : ''}`}
        aria-hidden="true"
      >
        <div ref={mountRef} className="hero__video-mount" />
      </div>
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
        {hasActivated && (
          <p className="hero__hint" aria-hidden="true">
            Tap the video or press space to pause
          </p>
        )}
      </div>

      {/* Initial big Play overlay — shown until the user activates. */}
      {!hasActivated && (
        <div className="hero__play-wrap">
          <button
            type="button"
            className="hero__play"
            onClick={(e) => { e.stopPropagation(); handlePlay(); }}
            aria-label="Play video with sound"
          >
            <PlayIcon />
          </button>
        </div>
      )}

      {/* Pause indicator — appears after activation whenever the video is
          paused, so the user knows tapping will resume it. */}
      {hasActivated && isPaused && (
        <div className="hero__pause-wrap" aria-hidden="true">
          <div className="hero__pause-indicator">
            <PlayIcon />
          </div>
        </div>
      )}
    </section>
  );
}
