import React from 'react';

export default function Reality() {
  return (
    <section className="rl" aria-label="What you actually see">
      <img
        className="ed-portrait"
        src="/images/portrait.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <div className="container rl__inner">
        <span className="eyebrow">Inside the channel</span>
        <h2 className="rl__title">No vague commentary. Real trades, in real time.</h2>
        <p className="rl__text">
          Every call in the channel is a trade the desk is actually taking — with explicit entries, stop-loss levels and clear invalidation criteria. No delay, no recycled content, no hopium.
        </p>
      </div>
    </section>
  );
}
