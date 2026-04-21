import React, { useCallback, useEffect, useRef, useState } from 'react';

// Short, copyright-safe test video (Google's "Me at the zoo" — ~19s, embeddable).
// Swap TEST_VIDEO_ID for the real promo clip when ready.
const TEST_VIDEO_ID = 'jNQXAC9IVRw';
const YT_API_SRC = 'https://www.youtube.com/iframe_api';

const YT_STATE_PLAYING = 1;
const YT_STATE_PAUSED = 2;

// If the pointer moved less than this many CSS pixels between pointerdown
// and pointerup we treat the gesture as a tap (pause toggle); otherwise
// it's a drag (new position).
const DRAG_CLICK_THRESHOLD = 6;
// Keep the mini-player a few px away from the viewport edges.
const MINI_MARGIN = 8;

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72c0 .79.87 1.27 1.54.85l10.79-6.86a1 1 0 0 0 0-1.7L9.54 4.29C8.87 3.87 8 4.35 8 5.14Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
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
  const frameRef = useRef(null);
  const playerRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [isMini, setIsMini] = useState(false);
  // User clicked the close button in the mini-player. Stays true until the
  // video starts playing again (re-activation) — at which point we allow
  // the mini-player to come back on subsequent scroll-outs.
  const [isMiniDismissed, setIsMiniDismissed] = useState(false);
  // Custom position of the mini-player after a drag. { x, y } in CSS px.
  // null = use the default bottom-right corner via CSS.
  const [miniPos, setMiniPos] = useState(null);

  const hasActivatedRef = useRef(false);
  useEffect(() => { hasActivatedRef.current = hasActivated; }, [hasActivated]);
  const inViewRef = useRef(true);
  useEffect(() => { inViewRef.current = inView; }, [inView]);
  const isMiniDismissedRef = useRef(false);
  useEffect(() => { isMiniDismissedRef.current = isMiniDismissed; }, [isMiniDismissed]);

  // Boot the YouTube player (exactly once per mount). Same player instance
  // is reused for main view, mini-player and all state toggles — there is
  // never a second player, so sync is intrinsic.
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
            if (e.data === YT_STATE_PLAYING) {
              setIsPaused(false);
              // Whenever the video resumes playing we re-enable the
              // mini-player for future scroll-outs.
              setIsMiniDismissed(false);
            } else if (e.data === YT_STATE_PAUSED) {
              setIsPaused(true);
            }
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

  // Initial Play: unmute + restart from 0. After this the Play overlay
  // unmounts and pause/resume UX takes over.
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
    setIsMiniDismissed(false);
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

  // Close (X) button in the mini-player: pause the shared video and hide
  // the mini-player. It will not reappear until the user plays the video
  // again from the hero (that resets isMiniDismissed via onStateChange).
  const handleCloseMini = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const p = playerRef.current;
    if (p && typeof p.pauseVideo === 'function') {
      try { p.pauseVideo(); } catch (_) {}
    }
    setIsMiniDismissed(true);
    setIsMini(false);
  }, []);

  // ---------------- Drag ----------------
  // Pointer-based drag that works for mouse, touch and stylus. We use
  // setPointerCapture so drags that leave the frame bounds still fire
  // events on our element. A tap (< threshold) falls through to
  // togglePause so clicking the mini to pause still works.
  const dragRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    maxMove: 0,
  });

  const clampToViewport = (x, y) => {
    const f = frameRef.current;
    if (!f) return { x, y };
    const w = f.offsetWidth;
    const h = f.offsetHeight;
    const maxX = window.innerWidth - w - MINI_MARGIN;
    const maxY = window.innerHeight - h - MINI_MARGIN;
    return {
      x: Math.max(MINI_MARGIN, Math.min(maxX, x)),
      y: Math.max(MINI_MARGIN, Math.min(maxY, y)),
    };
  };

  const handlePointerDown = useCallback((e) => {
    if (!isMini) return;
    // Don't start a drag from the close button — let the button handle it.
    if (e.target && e.target.closest && e.target.closest('.vb__mini-close')) return;
    const f = frameRef.current;
    if (!f) return;
    const rect = f.getBoundingClientRect();
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
      maxMove: 0,
    };
    try { f.setPointerCapture(e.pointerId); } catch (_) {}
  }, [isMini]);

  const handlePointerMove = useCallback((e) => {
    const s = dragRef.current;
    if (s.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    s.maxMove = Math.max(s.maxMove, Math.abs(dx) + Math.abs(dy));
    if (s.maxMove < DRAG_CLICK_THRESHOLD) return;
    const next = clampToViewport(s.originX + dx, s.originY + dy);
    setMiniPos(next);
  }, []);

  const handlePointerUp = useCallback((e) => {
    const s = dragRef.current;
    if (s.pointerId !== e.pointerId) return;
    const wasDrag = s.maxMove >= DRAG_CLICK_THRESHOLD;
    const f = frameRef.current;
    if (f) { try { f.releasePointerCapture(e.pointerId); } catch (_) {} }
    dragRef.current = { pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0, maxMove: 0 };
    if (!wasDrag && hasActivatedRef.current) {
      // Treated as a tap on the mini-player → toggle pause.
      togglePause();
    }
  }, [togglePause]);

  // Main-view click (not in mini): toggle pause on activated video.
  const handleBlockClick = useCallback((e) => {
    if (isMini) return; // drag handlers already handle this in mini mode
    if (!hasActivatedRef.current) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'a' || tag === 'button') return;
    togglePause();
  }, [isMini, togglePause]);

  // Spacebar pause/resume — only while the hero block is in view and the
  // user has activated audio. Does not interfere with the rest of the page.
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

  // Viewport behaviour for the hero video:
  //   visible                                     → close mini; resume
  //                                                 muted autoplay if we
  //                                                 were still in that
  //                                                 phase.
  //   not visible + activated + not dismissed     → open mini; do NOT
  //                                                 pause. Same iframe
  //                                                 reparents via CSS.
  //   not visible + activated + dismissed by X    → keep mini closed;
  //                                                 leave video paused.
  //   not visible + not yet activated             → pause quietly (save
  //                                                 bandwidth).
  useEffect(() => {
    const el = blockRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        setInView(visible);
        const p = playerRef.current;
        try {
          if (!visible && hasActivatedRef.current && !isMiniDismissedRef.current) {
            setIsMini(true);
          } else if (!visible && !hasActivatedRef.current) {
            setIsMini(false);
            if (p && typeof p.getPlayerState === 'function' &&
                p.getPlayerState() === YT_STATE_PLAYING) {
              p.pauseVideo();
            }
          } else {
            setIsMini(false);
            if (p && visible && !hasActivatedRef.current) {
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

  const frameStyle = isMini && miniPos ? {
    left: miniPos.x + 'px',
    top: miniPos.y + 'px',
    right: 'auto',
    bottom: 'auto',
  } : undefined;

  return (
    <section ref={blockRef} className="vb" aria-label="Intro video">
      <div className="container">
        <div className="vb__layout">
          <div
            ref={frameRef}
            className={frameClass}
            style={frameStyle}
            onClick={handleBlockClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
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

            {hasActivated && isPaused && !isMini && (
              <div className="vb__paused" aria-hidden="true">
                <PlayIcon />
              </div>
            )}

            {isMini && (
              <React.Fragment>
                {/* Visual affordance so the user knows the panel is draggable. */}
                <div className="vb__mini-grip" aria-hidden="true">
                  <span /><span /><span /><span /><span /><span />
                </div>
                <button
                  type="button"
                  className="vb__mini-close"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleCloseMini}
                  aria-label="Close mini player"
                >
                  <CloseIcon />
                </button>
                {hasActivated && isPaused && (
                  <div className="vb__mini-paused" aria-hidden="true">
                    <PlayIcon />
                  </div>
                )}
              </React.Fragment>
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
