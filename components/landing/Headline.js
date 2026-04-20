import React from 'react';

export default function Headline() {
  return (
    <section className="headline" aria-label="Headline">
      <div className="container headline__inner">
        <span className="headline__eyebrow">Private Trading Desk</span>
        <h1 className="headline__title">
          The market rewards <em>discipline</em>.
        </h1>
        <p className="headline__subtitle">
          Real-time signals, daily live review — delivered straight to your Telegram.
        </p>
      </div>
    </section>
  );
}
