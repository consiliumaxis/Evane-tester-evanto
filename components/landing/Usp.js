import React from 'react';

const POINTS = [
  { n: 'I',   text: 'Live trade calls pushed the moment the desk pulls the trigger.' },
  { n: 'II',  text: 'Morning market brief: macro catalysts and liquidity zones.' },
  { n: 'III', text: 'Risk-first discipline with a defined invalidation on every idea.' },
];

export default function Usp() {
  return (
    <section className="usp" aria-label="What you get">
      <div className="container">
        <ul className="usp__list">
          {POINTS.map((p) => (
            <li key={p.n} className="usp__item">
              <span className="usp__marker" aria-hidden="true">{p.n}</span>
              <span className="usp__text">{p.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
