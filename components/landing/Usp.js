import React from 'react';

const POINTS = [
  {
    n: 'I',
    title: 'Live trade calls',
    text: 'Entries, exits and stop-loss pushed the moment the desk pulls the trigger.',
  },
  {
    n: 'II',
    title: 'Daily market review',
    text: 'Macro catalysts and liquidity zones reviewed before the open.',
  },
  {
    n: 'III',
    title: 'Risk-first discipline',
    text: 'Every idea ships with a defined invalidation — no oversizing, no revenge trades.',
  },
];

export default function Usp() {
  return (
    <section className="usp" aria-label="What you get">
      <div className="container">
        <ol className="usp__list">
          {POINTS.map((p) => (
            <li key={p.n} className="usp__item">
              <span className="usp__n" aria-hidden="true">{p.n}.</span>
              <div className="usp__body">
                <h3 className="usp__title">{p.title}</h3>
                <p className="usp__text">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
