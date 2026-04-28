import React, { useCallback, useEffect, useRef, useState } from 'react';

// Wistia source for the hero player. The visible UI of the player (frame,
// rounded corners, overlay Play pill, mini-player, seek bar, icon cluster
// — every CSS class under .vb__) is unchanged from the previous iteration;
// only the integration layer below was swapped from YouTube IFrame API to
// Wistia Player API.
const WISTIA_VIDEO_ID = 'ttoixchr7k';
const WISTIA_E_V1_SRC = 'https://fast.wistia.com/assets/external/E-v1.js';

// Suppress every piece of native Wistia chrome — our own overlay controls
// take over.
const WISTIA_EMBED_OPTS = [
  'autoPlay=true',
  'muted=true',
  'controlsVisibleOnLoad=false',
  'playbar=false',
  'playButton=false',
  'bigPlayButton=false',
  'smallPlayButton=false',
  'volumeControl=false',
  'fullscreenButton=false',
  'qualityControl=false',
  'settingsControl=false',
  'playbackRateControl=false',
  'captionsButton=false',
  'endVideoBehavior=loop',
  'videoFoam=false',
];

const DRAG_CLICK_THRESHOLD = 6;
const MINI_MARGIN = 8;

// Quality is not exposed by the public Wistia Player API. Keep the gear
// menu visually identical, but show "Auto" only — picking it is a no-op.
const QUALITY_LABELS = { auto: 'Auto' };

// ---------- icons ----------
function IconPlay()  { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72c0 .79.87 1.27 1.54.85l10.79-6.86a1 1 0 0 0 0-1.7L9.54 4.29C8.87 3.87 8 4.35 8 5.14Z"/></svg>); }
function IconPause() { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5h3v14H8zM13 5h3v14h-3z"/></svg>); }
function IconClose() { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>); }
function IconVolume() { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 8.1v7.83A4.5 4.5 0 0 0 16.5 12zM14 4.1v2.06A8 8 0 0 1 14 19.83v2.06A10 10 0 0 0 14 4.1z"/></svg>); }
function IconMuted()  { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3zm13.59 2L19 9.41 17.59 8 15 10.59 12.41 8 11 9.41 13.59 12 11 14.59 12.41 16 15 13.41 17.59 16 19 14.59 16.59 12z"/></svg>); }

function IconCC() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="7.5"
        fontWeight="700"
        letterSpacing="0.5"
        fontFamily="Inter, system-ui, sans-serif"
      >
        CC
      </text>
    </svg>
  );
}

function IconGear() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.484.484 0 0 0 13.91 2h-3.84a.484.484 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.71 8.48c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94 0 .32.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.42.49.42h3.84c.23 0 .44-.18.49-.42l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
    </svg>
  );
}

function fmtTime(t) {
  if (!t || !isFinite(t) || t < 0) return '0:00';
  const total = Math.floor(t);
  const m = Math.floor(total / 60);
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Load Wistia E-v1.js + the per-video JSONP, then resolve with a video
// handle once the player is ready.
function loadWistiaPlayer(videoId) {
  if (typeof window === 'undefined') return Promise.reject();

  const ensureScript = (src) => {
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      document.body.appendChild(s);
    }
  };
  ensureScript(WISTIA_E_V1_SRC);
  ensureScript(`https://fast.wistia.com/embed/medias/${videoId}.jsonp`);

  return new Promise((resolve) => {
    window._wq = window._wq || [];
    window._wq.push({
      id: videoId,
      onReady: (video) => resolve(video),
    });
  });
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
  const [qualities] = useState([]); // intentionally always empty for Wistia
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [qualityOpen, setQualityOpen] = useState(false);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
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

  // Wire up Wistia. Same single-instance pattern as before — this video
  // handle is shared between main view and mini-player.
  // Performance: defer the Wistia network load until either (a) the
  // video block is approaching the viewport, or (b) the browser has been
  // idle for ~1.5 s. This unblocks LCP / TBT on mobile by keeping the
  // ~hundreds-of-KB Wistia bundle out of the initial parse.
  useEffect(() => {
    let cancelled = false;
    let booted = false;

    const boot = () => {
      if (booted || cancelled) return;
      booted = true;
      loadWistiaPlayer(WISTIA_VIDEO_ID).then((video) => {
        if (cancelled) return;
        playerRef.current = video;
        try {
          video.mute();
          if (inViewRef.current && typeof video.play === 'function') video.play();
          const d = typeof video.duration === 'function' ? video.duration() : 0;
          if (d) setDuration(d);
        } catch (_) {}

        if (typeof video.bind === 'function') {
          video.bind('play', () => {
            if (cancelled) return;
            setIsPaused(false);
            setIsMiniDismissed(false);
            try {
              const d = video.duration();
              if (d) setDuration((prev) => (Math.abs(prev - d) > 0.01 ? d : prev));
            } catch (_) {}
          });
          video.bind('pause', () => {
            if (cancelled) return;
            setIsPaused(true);
          });
          video.bind('timechange', (t) => {
            if (cancelled) return;
            if (isScrubbingRef.current) return;
            if (typeof t === 'number' && !Number.isNaN(t)) setCurrentTime(t);
          });
          video.bind('mutechange', (m) => {
            if (cancelled) return;
            setIsMuted(!!m);
          });
        }

        setIsReady(true);
      });
    };

    // (a) Trigger when the video block is within ~500px of the viewport.
    const el = blockRef.current;
    let lazyIo = null;
    if (el && typeof IntersectionObserver !== 'undefined') {
      lazyIo = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          boot();
          if (lazyIo) lazyIo.disconnect();
        }
      }, { rootMargin: '500px' });
      lazyIo.observe(el);
    } else {
      boot();
    }

    // (b) Idle-time fallback so the player still warms up on long pages
    //     where the user never scrolls toward the video.
    let idleId = null;
    let idleTimer = null;
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      idleId = window.requestIdleCallback(boot, { timeout: 2500 });
    } else {
      idleTimer = setTimeout(boot, 1500);
    }

    return () => {
      cancelled = true;
      if (lazyIo) lazyIo.disconnect();
      if (idleId && typeof window !== 'undefined' && window.cancelIdleCallback) {
        try { window.cancelIdleCallback(idleId); } catch (_) {}
      }
      if (idleTimer) clearTimeout(idleTimer);
      const v = playerRef.current;
      if (v && typeof v.remove === 'function') {
        try { v.remove(); } catch (_) {}
      }
      playerRef.current = null;
    };
  }, []);

  // --------- Player actions (mapped to Wistia API) ---------

  // First activation: rewind + unmute + play.
  const handlePlay = useCallback(() => {
    const v = playerRef.current;
    if (!v) return;
    try {
      if (typeof v.time === 'function') v.time(0);
      if (typeof v.unmute === 'function') v.unmute();
      if (typeof v.volume === 'function') v.volume(1);
      if (typeof v.play === 'function') v.play();
    } catch (_) {}
    setHasActivated(true);
    setIsPaused(false);
    setIsMuted(false);
    setIsMiniDismissed(false);
  }, []);

  const togglePause = useCallback(() => {
    const v = playerRef.current;
    if (!v || !hasActivatedRef.current) return;
    try {
      const s = typeof v.state === 'function' ? v.state() : null;
      if (s === 'playing') v.pause();
      else if (typeof v.play === 'function') v.play();
    } catch (_) {}
  }, []);

  const handlePlayPause = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!hasActivatedRef.current) handlePlay();
    else togglePause();
  }, [handlePlay, togglePause]);

  const handleMute = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const v = playerRef.current;
    if (!v) return;
    if (!hasActivatedRef.current) {
      // Un-muting from the silent autoplay phase counts as activation —
      // route through handlePlay so the video also rewinds to 0, per spec.
      handlePlay();
      return;
    }
    try {
      if (isMuted) {
        if (typeof v.unmute === 'function') v.unmute();
        if (typeof v.volume === 'function') v.volume(1);
        setIsMuted(false);
      } else {
        if (typeof v.mute === 'function') v.mute();
        setIsMuted(true);
      }
    } catch (_) {}
  }, [isMuted, handlePlay]);

  const handleCC = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const v = playerRef.current;
    if (!v) return;
    try {
      if (ccOn) {
        if (typeof v.captionsDisable === 'function') v.captionsDisable();
      } else {
        if (typeof v.captionsEnable === 'function') v.captionsEnable();
      }
    } catch (_) {}
    setCcOn((b) => !b);
  }, [ccOn]);

  const handleQualityToggle = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setQualityOpen((b) => !b);
  }, []);

  // Wistia handles bitrate adaptively; the public Player API doesn't expose
  // a quality switch. The menu stays — it's part of the existing UI — but
  // picking an option is a visual no-op.
  const handleQualityPick = useCallback((q) => (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setCurrentQuality(q);
    setQualityOpen(false);
  }, []);

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
  // Mirror duration + current time into React state every 250 ms while
  // not scrubbing. Wistia also fires 'timechange', but the polling loop
  // covers initial duration availability and edge cases uniformly.
  useEffect(() => {
    if (!isReady) return undefined;
    const id = setInterval(() => {
      if (isScrubbingRef.current) return;
      const v = playerRef.current;
      if (!v) return;
      try {
        if (typeof v.duration === 'function') {
          const d = v.duration();
          if (d && !Number.isNaN(d)) {
            setDuration((prev) => (Math.abs(prev - d) > 0.01 ? d : prev));
          }
        }
        if (typeof v.time === 'function') {
          const t = v.time();
          if (typeof t === 'number' && !Number.isNaN(t)) setCurrentTime(t);
        }
      } catch (_) {}
    }, 250);
    return () => clearInterval(id);
  }, [isReady]);

  const seekFromPointer = useCallback((clientX) => {
    const el = seekRef.current;
    if (!el) return;
    const d = duration || 0;
    if (!d) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const t = ratio * d;
    const v = playerRef.current;
    if (v && typeof v.time === 'function') {
      try { v.time(t); } catch (_) {}
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

  const handleFullscreen = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const v = playerRef.current;
    // Prefer Wistia's own fullscreen so the video is what enters
    // fullscreen (not our wrapper); fall back to the DOM API.
    if (v && typeof v.requestFullscreen === 'function') {
      try { v.requestFullscreen(); return; } catch (_) {}
    }
    const f = frameRef.current;
    if (f && typeof f.requestFullscreen === 'function') {
      try { f.requestFullscreen(); } catch (_) {}
    }
  }, []);

  const handleCloseMini = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const v = playerRef.current;
    if (v && typeof v.pause === 'function') {
      try { v.pause(); } catch (_) {}
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

  const handleBlockClick = useCallback((e) => {
    if (isMini) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'a' || tag === 'button') return;
    if (e.target && e.target.closest &&
        e.target.closest('.vb__panel, .vb__sound-pill, .vb__mini-close, .vb__mini-grip'))
      return;
    // First tap on the video starts playback with sound (same activation
    // path as the "Click for sound" pill); subsequent taps toggle pause.
    if (!hasActivatedRef.current) handlePlay();
    else togglePause();
  }, [isMini, togglePause, handlePlay]);

  // Spacebar pause/resume, scoped to hero in viewport + activated.
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

  // Viewport behaviour: open mini-player on scroll-out (when activated),
  // pause silent autoplay when scrolling out before activation.
  useEffect(() => {
    const el = blockRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        setInView(visible);
        const v = playerRef.current;
        try {
          if (!visible && hasActivatedRef.current && !isMiniDismissedRef.current) {
            setIsMini(true);
          } else if (!visible && !hasActivatedRef.current) {
            setIsMini(false);
            if (v && typeof v.state === 'function' && v.state() === 'playing') {
              v.pause();
            }
          } else {
            setIsMini(false);
            if (v && visible && !hasActivatedRef.current && typeof v.play === 'function') {
              v.play();
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

  const showPlayIcon = !hasActivated || isPaused;
  const playLabel = !hasActivated ? 'Play' : (isPaused ? 'Play' : 'Pause');

  // Wistia exposes no quality list, so this collapses to the "Auto" entry
  // we keep around to preserve the existing menu look.
  const qualityList = (() => {
    const out = [];
    qualities.forEach((q) => { if (!out.includes(q)) out.push(q); });
    if (!out.includes('auto')) out.push('auto');
    return out;
  })();

  const wistiaMountClass =
    'vb__mount wistia_embed wistia_async_' +
    WISTIA_VIDEO_ID +
    ' ' + WISTIA_EMBED_OPTS.join(' ');

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
            {/* Wistia hydrates this div in place; .vb__mount keeps the same
                positioning + size + clipping CSS as before. */}
            <div ref={mountRef} className={wistiaMountClass} />
            <div className="vb__overlay" aria-hidden="true" />

            {/* "Click for sound" prompt, top-right, while still in
                muted-autoplay phase. Click activates sound + restart. */}
            {!hasActivated && !isMini && (
              <button
                type="button"
                className="vb__sound-pill"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handlePlay}
                aria-label="Click for sound"
              >
                <span>Click for sound</span>
                <IconVolume />
              </button>
            )}

            {/* Mini-only chrome: drag grip, close button, paused overlay. */}
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

            {/* Inline bottom control bar: play | time | seek | mute | gear | full.
                Used for main view and (compacted) for the mini-player. */}
            {hasActivated && (
              <div
                className={'vb__panel' + (isMini ? ' vb__panel--mini' : '')}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="vb__btn vb__btn--play"
                  onClick={handlePlayPause}
                  aria-label={showPlayIcon ? 'Play video' : 'Pause video'}
                >
                  {showPlayIcon ? <IconPlay /> : <IconPause />}
                </button>

                <span className="vb__time" aria-live="off">
                  {fmtTime(currentTime)}
                </span>

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

                <button
                  type="button"
                  className={'vb__btn' + (!isMuted ? ' vb__btn--on' : '')}
                  onClick={handleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <IconMuted /> : <IconVolume />}
                </button>

                {!isMini && (
                  <div className="vb__quality" ref={qualityPanelRef}>
                    <button
                      type="button"
                      className={'vb__btn' + (qualityOpen ? ' vb__btn--on' : '')}
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
                            onClick={handleQualityPick(q)}
                          >
                            {QUALITY_LABELS[q] || q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!isMini && (
                  <button
                    type="button"
                    className="vb__btn"
                    onClick={handleFullscreen}
                    aria-label="Fullscreen"
                    title="Fullscreen"
                  >
                    <IconExpand />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
