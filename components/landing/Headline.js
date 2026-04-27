import React from 'react';

// Decorative trading-chart backdrop. Pure SVG, layered absolutely behind
// the headline text — it never affects layout, never receives clicks, and
// never reflows. Tuned so the right side reads as a calm bullish chart
// while the left side fades out so the centered headline stays clean.
function HeroChart() {
  // Each candle: x position (px in viewBox), open / close / high / low (y).
  // y grows downward so a smaller close-y than open-y means a bullish (up)
  // candle. The set sketches a gentle uptrend.
  const candles = [
    { x: 420, o: 232, c: 218, h: 212, l: 238 },
    { x: 450, o: 218, c: 226, h: 213, l: 230 },
    { x: 480, o: 226, c: 208, h: 204, l: 230 },
    { x: 510, o: 208, c: 200, h: 196, l: 212 },
    { x: 540, o: 200, c: 210, h: 196, l: 215 },
    { x: 570, o: 210, c: 196, h: 190, l: 214 },
    { x: 600, o: 196, c: 182, h: 176, l: 200 },
    { x: 630, o: 182, c: 188, h: 176, l: 192 },
    { x: 660, o: 188, c: 172, h: 166, l: 196 },
    { x: 690, o: 172, c: 158, h: 152, l: 178 },
    { x: 720, o: 158, c: 168, h: 152, l: 172 },
    { x: 750, o: 168, c: 148, h: 142, l: 174 },
    { x: 780, o: 148, c: 132, h: 126, l: 152 },
  ];

  const trendPoints = candles
    .map((c) => `${c.x},${(c.o + c.c) / 2}`)
    .join(' ');

  return (
    <svg
      className="hd-chart"
      viewBox="0 0 800 300"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="hdChartGlow" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(201,164,76,0)" />
          <stop offset="100%" stopColor="rgba(201,164,76,0.22)" />
        </linearGradient>
      </defs>

      {/* horizontal grid */}
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1="0"
          x2="800"
          y1={20 + i * 40}
          y2={20 + i * 40}
          stroke="rgba(245,242,234,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* vertical grid */}
      {Array.from({ length: 13 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={20 + i * 60}
          x2={20 + i * 60}
          y1="0"
          y2="300"
          stroke="rgba(245,242,234,0.04)"
          strokeWidth="1"
        />
      ))}

      {/* glow under the trend line */}
      <path
        d={
          `M${candles[0].x} ${(candles[0].o + candles[0].c) / 2} ` +
          candles.map((c) => `L${c.x} ${(c.o + c.c) / 2}`).join(' ') +
          ` L${candles[candles.length - 1].x} 300 L${candles[0].x} 300 Z`
        }
        fill="url(#hdChartGlow)"
        opacity="0.55"
      />

      {/* candlesticks */}
      {candles.map((c, i) => {
        const bullish = c.c < c.o;
        const stroke = bullish ? 'rgba(224,189,104,0.85)' : 'rgba(245,242,234,0.34)';
        const fill = bullish ? 'rgba(201,164,76,0.55)' : 'rgba(245,242,234,0.1)';
        const top = Math.min(c.o, c.c);
        const h = Math.max(1, Math.abs(c.o - c.c));
        return (
          <g key={i}>
            <line
              x1={c.x}
              x2={c.x}
              y1={c.h}
              y2={c.l}
              stroke={stroke}
              strokeWidth="1.2"
            />
            <rect
              x={c.x - 4}
              y={top}
              width="8"
              height={h}
              rx="1"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.2"
            />
          </g>
        );
      })}

      {/* trend line */}
      <polyline
        points={trendPoints}
        fill="none"
        stroke="rgba(224,189,104,0.55)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Headline() {
  return (
    <section className="hd" aria-label="Headline">
      <HeroChart />
      <div className="container hd__inner">
        <span className="eyebrow">Private Trading Desk</span>
        <h1 className="hd__title">
          The market rewards <span className="hd__accent">discipline</span>.
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
