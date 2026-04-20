import React, { useCallback, useEffect, useRef, useState } from 'react';

// Short, copyright-safe test video (Google's "Me at the zoo" — ~19s, embeddable).
// Swap TEST_VIDEO_ID for the real promo clip when ready.
const TEST_VIDEO_ID = 'jNQXAC9IVRw';
const YT_API_SRC = 'https://www.youtube.com/iframe_api';

const YT_STATE_PLAYING = 1;
const YT_STATE_PAUSED = 2;

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72c0 .79.87 1.27 1.54.85l10.79-6.86a1 1 0 0 0 0-1.7L9.54 4.29C8.87 3.87 8 4.35 8 5.14Z" />
    </svg>
  );
}

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

export default function VideoBlock() {
  const blockRef = useRef(null);
  const mountRef = useRef(null);
  const playerRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [inView, setInView] = useState(true);

  const hasActivatedRef = useRef(false);
  useEffect(() => { hasActivatedRef.current = hasActivated; }, [hasActivated]);
  const inViewRef = useRef(true);
  useEffect(() => { inViewRef.current = inView; }, [inView]);

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
              if (inViewRef.current) e.target.playVideo();
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
      if (state === YT_STATE_PLAYING) p.pauseVideo();
      else p.playVideo();
    } catch (_) {}
  }, []);

  const handleBlockClick = useCallback((e) => {
    if (!hasActivatedRef.current) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'a' || tag === 'button') return;
    togglePause();
  }, [togglePause]);

  useEffect(() => {
    if (!inView || !hasActivated) return;
    const onKey = (e) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      const t = e.target;
      const tag = (t && t.tagName ? t.tagName : '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag) || (t && t.isContentEditable)) return;
      if (tag === 'button' || tag === 'a') return;
      e.preventDefault();
      togglePause();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inView, hasActivated, togglePause]);

  useEffect(() => {
    const el = blockRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        setInView(visible);
        const p = playerRef.current;
        if (!p) return;
        try {
          if (!visible) {
            if (typeof p.getPlayerState === 'function' && p.getPlayerState() === YT_STATE_PLAYING) {
              p.pauseVideo();
            }
          } else if (!hasActivatedRef.current) {
            p.playVideo();
          }
        } catch (_) {}
      },
      { threshold: [0, 0.25, 0.6] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={blockRef} className="vb" aria-label="Intro video">
      <div className="container">
        <div
          className={'vb__frame' + (isReady ? ' vb__frame--ready' : '')}
          onClick={handleBlockClick}
        >
          <div ref={mountRef} className="vb__mount" />
          <div className="vb__overlay" aria-hidden="true" />
          <div className="vb__corner vb__corner--tl" aria-hidden="true" />
          <div className="vb__corner vb__corner--tr" aria-hidden="true" />
          <div className="vb__corner vb__corner--bl" aria-hidden="true" />
          <div className="vb__corner vb__corner--br" aria-hidden="true" />

          {!hasActivated && (
            <button
              type="button"
              className="vb__play"
              onClick={(e) => { e.stopPropagation(); handlePlay(); }}
              aria-label="Play video with sound"
            >
              <PlayIcon />
            </button>
          )}

          {hasActivated && isPaused && (
            <div className="vb__paused" aria-hidden="true">
              <PlayIcon />
            </div>
          )}
        </div>
        {hasActivated && (
          <p className="vb__hint" aria-hidden="true">
            Click the video or press space to pause / resume
          </p>
        )}
      </div>
    </section>
  );
}
