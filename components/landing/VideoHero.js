import React, { useCallback, useEffect, useRef, useState } from 'react';

// Short, copyright-safe test video hosted on YouTube (Google's "Me at the zoo",
// the very first YouTube upload, ~19s, embeddable). Swap TEST_VIDEO_ID for the
// real promo clip when you have one.
const TEST_VIDEO_ID = 'jNQXAC9IVRw';
const YT_API_SRC = 'https://www.youtube.com/iframe_api';

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
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isUserPlaying, setIsUserPlaying] = useState(false);

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
          playlist: TEST_VIDEO_ID, // required for loop=1 to take effect
        },
        events: {
          onReady: (e) => {
            try {
              e.target.mute();
              e.target.playVideo();
            } catch (_) {}
            if (!cancelled) setIsReady(true);
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
    // Spec: restart from the beginning with sound on — not resume.
    try {
      p.seekTo(0, true);
      p.unMute();
      if (typeof p.setVolume === 'function') p.setVolume(100);
      p.playVideo();
    } catch (_) {
      // If any API call fails, we still hide the overlay so the user sees
      // the video running; subsequent calls will succeed once onReady fires.
    }
    setIsUserPlaying(true);
  }, []);

  return (
    <section className="hero" aria-label="Intro">
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
