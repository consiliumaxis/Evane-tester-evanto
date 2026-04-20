import React from 'react';

export default function Headline() {
  return (
    <section className="hd" aria-label="Headline">
      <div className="container hd__inner">
        <span className="eyebrow">Private Trading Desk</span>
        <h1 className="hd__title">
          The market rewards <em>discipline</em>.
          <br />
          We trade it every day.
        </h1>
        <p className="hd__lead">
          Institutional-grade signals, real-time commentary and a daily live review — delivered straight to your Telegram.
        </p>
      </div>
    </section>
  );
}
