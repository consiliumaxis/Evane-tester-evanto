import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'cc-accepted';

// Tiny cookie-consent banner. No external CMP, no third-party script —
// just a single <div> with a localStorage flag. Initial render is null
// so there is zero markup before the effect reads the flag (and zero
// hydration mismatch). After Accept the flag is persisted and the
// banner unmounts for the rest of the session.
export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' &&
          !window.localStorage.getItem(STORAGE_KEY)) {
        setShow(true);
      }
    } catch (_) {}
  }, []);

  if (!show) return null;

  const accept = () => {
    try { window.localStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
    setShow(false);
  };

  return (
    <div className="cc-root" role="dialog" aria-label="Cookie consent">
      <div className="cc-card">
        <p className="cc-text">
          We use cookies to keep the site working and to remember your
          preferences. By clicking Accept you agree to our use of cookies.
        </p>
        <button type="button" className="cc-btn" onClick={accept}>
          Accept
        </button>
        <div className="cc-links">
          <a href="/privacy-policy/#cookies">Cookie Policy</a>
          <span aria-hidden="true">·</span>
          <a href="/privacy-policy/">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
