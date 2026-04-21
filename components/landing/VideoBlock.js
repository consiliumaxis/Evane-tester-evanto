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

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
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
  // Mini-player mode: the same DOM iframe is reparented (via CSS only) into
  // a fixed corner panel so the video keeps playing seamlessly.
  const [isMini, setIsMini] = useState(false);

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

  // Initial Play: unmute + restart from 0. Only happens once, when the user
  // first activates the player. After that the same control toggles pause.
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

  // Click anywhere in the frame (after activation) toggles pause. Buttons /
  // links inside the frame keep their own click semantics.
  const handleBlockClick = useCallback((e) => {
    if (!hasActivatedRef.current) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'a' || tag === 'button') return;
    togglePause();
  }, [togglePause]);

  // Spacebar pause/resume. Active only while the main hero block is in view
  // (we don't want space to hijack scrolling once the video is in the
  // mini-player) and the user has already activated audio.
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

  // Viewport behaviour:
  //   * Activated + scrolled out  → mini-player (video keeps playing).
  //   * Activated + scrolled back → mini-player closes; main view resumes
  //                                 the same video, same position (it's the
  //                                 exact same iframe — only the wrapper's
  //                                 CSS class flips, the player instance is
  //                                 never destroyed or re-mounted).
  //   * Not activated yet (muted autoplay phase)  → pause when out of view
  //                                                 to save bandwidth, then
  //                                                 quietly resume on
  //                                                 re-enter. No mini-player
  //                                                 in this phase.
  useEffect(() => {
    const el = blockRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        setInView(visible);
        const p = playerRef.current;
        try {
          if (!visible && hasActivatedRef.current) {
            // Activated → switch to mini, do NOT pause.
            setIsMini(true);
          } else if (!visible && !hasActivatedRef.current) {
            // Muted autoplay phase → pause silently to save resources.
            setIsMini(false);
            if (p && typeof p.getPlayerState === 'function' &&
                p.getPlayerState() === YT_STATE_PLAYING) {
              p.pauseVideo();
            }
          } else {
            // visible
            setIsMini(false);
            if (p && !hasActivatedRef.current) {
              p.playVideo();
            }
          }
        } catch (_) {}
      },
      { threshold: [0, 0.25, 0.6] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const frameClass =
    'vb__frame' +
    (isReady ? ' vb__frame--ready' : '') +
    (isMini ? ' vb__frame--mini' : '');

  return (
    <section ref={blockRef} className="vb" aria-label="Intro video">
      <div className="container">
        {/* Always-present 16:9 layout slot. It keeps the page height stable
            even while the actual frame is detached into the corner mini. */}
        <div className="vb__layout">
          <div className={frameClass} onClick={handleBlockClick}>
            <div ref={mountRef} className="vb__mount" />
            <div className="vb__overlay" aria-hidden="true" />

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

            {/* Visible only in mini mode: shows the current play / pause
                state and gives a clear tap target on mobile. The whole
                frame is also tappable, but the icon makes the affordance
                obvious. */}
            {isMini && (
              <button
                type="button"
                className="vb__mini-toggle"
                onClick={(e) => { e.stopPropagation(); togglePause(); }}
                aria-label={isPaused ? 'Resume video' : 'Pause video'}
              >
                {isPaused ? <PlayIcon /> : <PauseIcon />}
              </button>
            )}
          </div>
        </div>
        {hasActivated && !isMini && (
          <p className="vb__hint" aria-hidden="true">
            Click the video or press space to pause / resume
          </p>
        )}
      </div>
    </section>
  );
}
