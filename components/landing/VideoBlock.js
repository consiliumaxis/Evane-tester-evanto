import React, { useCallback, useEffect, useRef, useState } from 'react';

// Short, copyright-safe test video (Google's "Me at the zoo" — ~19s, embeddable).
// Swap TEST_VIDEO_ID for the real promo clip when ready.
const TEST_VIDEO_ID = 'jNQXAC9IVRw';
const YT_API_SRC = 'https://www.youtube.com/iframe_api';

const YT_STATE_PLAYING = 1;
const YT_STATE_PAUSED = 2;

const DRAG_CLICK_THRESHOLD = 6;
const MINI_MARGIN = 8;

// Human-readable labels for YouTube quality codes.
const QUALITY_LABELS = {
  highres: '4K+',
  hd2160: '2160p',
  hd1440: '1440p',
  hd1080: '1080p',
  hd720: '720p',
  large: '480p',
  medium: '360p',
  small: '240p',
  tiny: '144p',
  auto: 'Auto',
};
const QUALITY_ORDER = ['highres','hd2160','hd1440','hd1080','hd720','large','medium','small','tiny','auto'];

// ---------- icons ----------
function IconPlay()  { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72c0 .79.87 1.27 1.54.85l10.79-6.86a1 1 0 0 0 0-1.7L9.54 4.29C8.87 3.87 8 4.35 8 5.14Z"/></svg>); }
function IconPause() { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5h3v14H8zM13 5h3v14h-3z"/></svg>); }
function IconClose() { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>); }
function IconVolume() { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 8.1v7.83A4.5 4.5 0 0 0 16.5 12zM14 4.1v2.06A8 8 0 0 1 14 19.83v2.06A10 10 0 0 0 14 4.1z"/></svg>); }
function IconMuted()  { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3zm13.59 2L19 9.41 17.59 8 15 10.59 12.41 8 11 9.41 13.59 12 11 14.59 12.41 16 15 13.41 17.59 16 19 14.59 16.59 12z"/></svg>); }
function IconCC()     { return (<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M9 11c-.6-.6-1.4-1-2.2-1-1.5 0-2.8 1.3-2.8 3s1.3 3 2.8 3c.8 0 1.6-.4 2.2-1M17 11c-.6-.6-1.4-1-2.2-1-1.5 0-2.8 1.3-2.8 3s1.3 3 2.8 3c.8 0 1.6-.4 2.2-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/></svg>); }
function IconGear()   { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.3.2.64.2 1s-.06.7-.2 1Z"/></svg>); }

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
  const qualityPanelRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [ccOn, setCcOn] = useState(false);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [qualityOpen, setQualityOpen] = useState(false);

  // Seek-bar state: current position and total duration (seconds).
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  // Scrubbing ref — while the user drags the handle we freeze updates
  // from the player's own clock to avoid snap-back.
  const isScrubbingRef = useRef(false);
  const seekRef = useRef(null);

  const [inView, setInView] = useState(true);
  const [isMini, setIsMini] = useState(false);
  const [isMiniDismissed, setIsMiniDismissed] = useState(false);
  const [miniPos, setMiniPos] = useState(null);

  const hasActivatedRef = useRef(false);
  useEffect(() => { hasActivatedRef.current = hasActivated; }, [hasActivated]);
  const inViewRef = useRef(true);
  useEffect(() => { inViewRef.current = inView; }, [inView]);
  const isMiniDismissedRef = useRef(false);
  useEffect(() => { isMiniDismissedRef.current = isMiniDismissed; }, [isMiniDismissed]);

  // Boot the YouTube player exactly once. Standard YouTube controls are
  // suppressed (controls:0) — we layer our own custom overlay on top.
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
          cc_load_policy: 0,
          cc_lang_pref: 'en',
        },
        events: {
          onReady: (e) => {
            try {
              e.target.mute();
              if (inViewRef.current) e.target.playVideo();
              if (typeof e.target.getAvailableQualityLevels === 'function') {
                const q = e.target.getAvailableQualityLevels() || [];
                setQualities(q);
              }
            } catch (_) {}
            if (!cancelled) setIsReady(true);
          },
          onStateChange: (e) => {
            if (cancelled) return;
            if (e.data === YT_STATE_PLAYING) {
              setIsPaused(false);
              setIsMiniDismissed(false);
              // Quality list sometimes populates only after PLAYING.
              try {
                if (typeof e.target.getAvailableQualityLevels === 'function') {
                  const q = e.target.getAvailableQualityLevels() || [];
                  if (q.length) setQualities(q);
                }
                if (typeof e.target.getPlaybackQuality === 'function') {
                  setCurrentQuality(e.target.getPlaybackQuality() || 'auto');
                }
              } catch (_) {}
            } else if (e.data === YT_STATE_PAUSED) {
              setIsPaused(true);
            }
          },
          onPlaybackQualityChange: (e) => {
            if (cancelled) return;
            setCurrentQuality(e.data || 'auto');
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

  // --------- Player actions ---------

  // First activation: unmute + restart from 0.
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
    setIsMuted(false);
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

  // Bottom-left pill. Before activation it is the one big Play control.
  // After activation it toggles Play/Pause.
  const handlePlayPause = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!hasActivatedRef.current) handlePlay();
    else togglePause();
  }, [handlePlay, togglePause]);

  const handleMute = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const p = playerRef.current;
    if (!p) return;
    if (!hasActivatedRef.current) {
      // Turning sound on from the muted autoplay phase is effectively an
      // activation — go through the same seek+unmute+play path so the
      // video restarts from the beginning with sound, per spec.
      handlePlay();
      return;
    }
    try {
      if (isMuted) {
        p.unMute();
        if (typeof p.setVolume === 'function') p.setVolume(100);
        setIsMuted(false);
      } else {
        p.mute();
        setIsMuted(true);
      }
    } catch (_) {}
  }, [isMuted, handlePlay]);

  const handleCC = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const p = playerRef.current;
    if (!p) return;
    try {
      if (ccOn) {
        if (typeof p.unloadModule === 'function') p.unloadModule('captions');
      } else {
        if (typeof p.loadModule === 'function') p.loadModule('captions');
        if (typeof p.setOption === 'function') {
          p.setOption('captions', 'reload', true);
        }
      }
    } catch (_) {}
    setCcOn((v) => !v);
  }, [ccOn]);

  const handleQualityToggle = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setQualityOpen((v) => !v);
  }, []);

  const handleQualityPick = useCallback((q) => (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const p = playerRef.current;
    if (p && typeof p.setPlaybackQuality === 'function') {
      try { p.setPlaybackQuality(q); } catch (_) {}
    }
    setCurrentQuality(q);
    setQualityOpen(false);
  }, []);

  // Close quality menu when clicking elsewhere.
  useEffect(() => {
    if (!qualityOpen) return;
    const onDocDown = (ev) => {
      const el = qualityPanelRef.current;
      if (el && el.contains(ev.target)) return;
      setQualityOpen(false);
    };
    document.addEventListener('pointerdown', onDocDown, true);
    return () => document.removeEventListener('pointerdown', onDocDown, true);
  }, [qualityOpen]);

  // --------- Seek bar ---------
  // Poll the YouTube player for current time + duration every 250 ms and
  // mirror it into React state so the seek bar re-renders. Freezes while
  // the user is actively scrubbing.
  useEffect(() => {
    if (!isReady) return undefined;
    const id = setInterval(() => {
      if (isScrubbingRef.current) return;
      const p = playerRef.current;
      if (!p) return;
      try {
        if (typeof p.getDuration === 'function') {
          const d = p.getDuration();
          if (d && !Number.isNaN(d)) {
            setDuration((prev) => (Math.abs(prev - d) > 0.01 ? d : prev));
          }
        }
        if (typeof p.getCurrentTime === 'function') {
          const t = p.getCurrentTime();
          if (!Number.isNaN(t)) setCurrentTime(t);
        }
      } catch (_) {}
    }, 250);
    return () => clearInterval(id);
  }, [isReady]);

  // Convert a pointer clientX into a time and seek the player.
  const seekFromPointer = useCallback((clientX) => {
    const el = seekRef.current;
    if (!el) return;
    const d = duration || 0;
    if (!d) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const t = ratio * d;
    const p = playerRef.current;
    if (p && typeof p.seekTo === 'function') {
      try { p.seekTo(t, true); } catch (_) {}
    }
    setCurrentTime(t);
  }, [duration]);

  const handleSeekDown = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const el = seekRef.current;
    if (el) { try { el.setPointerCapture(e.pointerId); } catch (_) {} }
    isScrubbingRef.current = true;
    seekFromPointer(e.clientX);
  }, [seekFromPointer]);

  const handleSeekMove = useCallback((e) => {
    if (!isScrubbingRef.current) return;
    if (e && e.stopPropagation) e.stopPropagation();
    seekFromPointer(e.clientX);
  }, [seekFromPointer]);

  const handleSeekUp = useCallback((e) => {
    if (!isScrubbingRef.current) return;
    if (e && e.stopPropagation) e.stopPropagation();
    const el = seekRef.current;
    if (el) { try { el.releasePointerCapture(e.pointerId); } catch (_) {} }
    seekFromPointer(e.clientX);
    isScrubbingRef.current = false;
  }, [seekFromPointer]);

  // --------- Mini-player drag + close ---------

  const handleCloseMini = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const p = playerRef.current;
    if (p && typeof p.pauseVideo === 'function') {
      try { p.pauseVideo(); } catch (_) {}
    }
    setIsMiniDismissed(true);
    setIsMini(false);
  }, []);

  const dragRef = useRef({ pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0, maxMove: 0 });

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
    if (!wasDrag && hasActivatedRef.current) togglePause();
  }, [togglePause]);

  // Main-view frame click: tap on the video surface between controls
  // toggles pause. Buttons inside the frame stopPropagation so they
  // don't bubble here.
  const handleBlockClick = useCallback((e) => {
    if (isMini) return;
    if (!hasActivatedRef.current) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'a' || tag === 'button') return;
    // Also ignore clicks that originated inside an overlay control.
    if (e.target && e.target.closest && e.target.closest('.vb__ctrl')) return;
    togglePause();
  }, [isMini, togglePause]);

  // Spacebar pause/resume.
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

  // Viewport behaviour: mini-player on scroll-out (when activated), not a pause.
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

  // Derive what the Play/Pause pill label should show.
  const showPlayIcon = !hasActivated || isPaused;
  const playLabel = !hasActivated ? 'Play' : (isPaused ? 'Play' : 'Pause');

  // Build quality menu list — order known codes first, then any others.
  const qualityList = (() => {
    const out = [];
    const seen = new Set();
    QUALITY_ORDER.forEach((q) => {
      if (qualities.includes(q)) { out.push(q); seen.add(q); }
    });
    qualities.forEach((q) => { if (!seen.has(q)) out.push(q); });
    if (!out.includes('auto')) out.push('auto');
    return out;
  })();

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

            {/* Custom main controls — hidden when the panel is in mini mode. */}
            {!isMini && (
              <React.Fragment>
                {/* Seek bar: thin full-width progress track with a draggable
                    handle. Lives in its own .vb__ctrl row so the overlay
                    pointer-events rules apply and the frame's tap-to-pause
                    / drag handlers can distinguish it. */}
                <div className="vb__ctrl vb__ctrl-seek">
                  <div
                    ref={seekRef}
                    className="vb__seek"
                    onPointerDown={handleSeekDown}
                    onPointerMove={handleSeekMove}
                    onPointerUp={handleSeekUp}
                    onPointerCancel={handleSeekUp}
                    role="slider"
                    aria-label="Seek"
                    aria-valuemin={0}
                    aria-valuemax={Math.round(duration || 0)}
                    aria-valuenow={Math.round(currentTime || 0)}
                    tabIndex={0}
                  >
                    <div className="vb__seek-track" />
                    <div
                      className="vb__seek-fill"
                      style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                    />
                    <div
                      className="vb__seek-handle"
                      style={{ left: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                    />
                  </div>
                </div>

                <div className="vb__ctrl vb__ctrl-left">
                  <button
                    type="button"
                    className="vb__pill"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={handlePlayPause}
                    aria-label={showPlayIcon ? 'Play video' : 'Pause video'}
                  >
                    <span className="vb__pill-icon">
                      {showPlayIcon ? <IconPlay /> : <IconPause />}
                    </span>
                    <span className="vb__pill-label">{playLabel}</span>
                  </button>
                </div>

                <div className="vb__ctrl vb__ctrl-right">
                  <div className="vb__quality" ref={qualityPanelRef}>
                    <button
                      type="button"
                      className={'vb__icon-btn' + (qualityOpen ? ' vb__icon-btn--on' : '')}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={handleQualityToggle}
                      aria-haspopup="menu"
                      aria-expanded={qualityOpen ? 'true' : 'false'}
                      aria-label="Video quality"
                      title="Quality"
                    >
                      <IconGear />
                    </button>
                    {qualityOpen && (
                      <div className="vb__quality-menu" role="menu">
                        {qualityList.map((q) => (
                          <button
                            key={q}
                            type="button"
                            role="menuitem"
                            className={
                              'vb__quality-item' +
                              (q === currentQuality ? ' vb__quality-item--active' : '')
                            }
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={handleQualityPick(q)}
                          >
                            {QUALITY_LABELS[q] || q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className={'vb__icon-btn' + (!isMuted ? ' vb__icon-btn--on' : '')}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={handleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <IconMuted /> : <IconVolume />}
                  </button>

                  <button
                    type="button"
                    className={'vb__icon-btn' + (ccOn ? ' vb__icon-btn--on' : '')}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={handleCC}
                    aria-label={ccOn ? 'Hide captions' : 'Show captions'}
                    title="Subtitles"
                  >
                    <IconCC />
                  </button>
                </div>
              </React.Fragment>
            )}

            {/* Mini-player chrome — unchanged. */}
            {isMini && (
              <React.Fragment>
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
                  <IconClose />
                </button>
                {hasActivated && isPaused && (
                  <div className="vb__mini-paused" aria-hidden="true">
                    <IconPlay />
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
