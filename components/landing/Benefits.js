import React from 'react';

const ITEMS = [
  {
    num: 'I',
    title: 'Live trade calls',
    text: 'Entries, exits and stop-loss levels pushed the moment the desk pulls the trigger — no delay, no filler.',
  },
  {
    num: 'II',
    title: 'Daily market review',
    text: 'Morning brief on what matters: macro catalysts, liquidity zones and what the desk is watching into the open.',
  },
  {
    num: 'III',
    title: 'Risk first',
    text: 'Every idea comes with a defined invalidation. No hopium, no oversized positions, no revenge trading.',
  },
];

export default function Benefits() {
  return (
    <section className="benefits section" aria-label="What you get">
      <div className="container">
        <p className="section__eyebrow">Inside the channel</p>
        <h2 className="section__title">What you receive</h2>
        <div className="section__divider" />
        <div className="benefits__grid">
          {ITEMS.map((it) => (
            <article key={it.num} className="benefit">
              <div className="benefit__num">{it.num}.</div>
              <h3 className="benefit__title">{it.title}</h3>
              <p className="benefit__text">{it.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
