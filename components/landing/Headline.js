import React from 'react';

// Decorative trading-chart backdrop. Pure SVG, layered absolutely behind
// the headline text — it never affects layout, never receives clicks, and
// never reflows. Tuned so the right side reads as a calm bullish chart
// while the left side fades out so the centered headline stays clean.
function HeroChart() {
  // Each candle: x position (px in viewBox), open / close / high / low (y).
  // Spread across the full 0–800 viewBox width so the chart reads as a
  // continuous market backdrop, not a corner accent.
  // Fewer candles + grid lines than the first pass. Trims the SVG node
  // count nearly in half (~50 → ~25) without losing the chart's
  // editorial bullish-uptrend feel.
  const candles = [
    { x: 30,  o: 246, c: 232, h: 228, l: 250 },
    { x: 80,  o: 232, c: 238, h: 228, l: 242 },
    { x: 130, o: 238, c: 220, h: 216, l: 242 },
    { x: 180, o: 220, c: 226, h: 216, l: 230 },
    { x: 230, o: 226, c: 208, h: 204, l: 230 },
    { x: 280, o: 208, c: 214, h: 204, l: 218 },
    { x: 330, o: 214, c: 196, h: 192, l: 218 },
    { x: 380, o: 196, c: 200, h: 192, l: 204 },
    { x: 430, o: 200, c: 184, h: 180, l: 204 },
    { x: 480, o: 184, c: 188, h: 180, l: 192 },
    { x: 530, o: 188, c: 168, h: 162, l: 192 },
    { x: 580, o: 168, c: 172, h: 162, l: 176 },
    { x: 630, o: 172, c: 152, h: 148, l: 176 },
    { x: 680, o: 152, c: 158, h: 148, l: 162 },
    { x: 730, o: 158, c: 134, h: 128, l: 162 },
    { x: 780, o: 134, c: 118, h: 112, l: 138 },
  ];

  const trendPoints = candles
    .map((c) => `${c.x},${(c.o + c.c) / 2}`)
    .join(' ');

  return (
    <svg
      className="hd-chart"
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="hdChartGlow" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(201,164,76,0)" />
          <stop offset="100%" stopColor="rgba(201,164,76,0.22)" />
        </linearGradient>
      </defs>

      {/* horizontal grid (5 lines instead of 7) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1="0"
          x2="800"
          y1={40 + i * 55}
          y2={40 + i * 55}
          stroke="rgba(245,242,234,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* vertical grid (8 lines instead of 13) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={50 + i * 100}
          x2={50 + i * 100}
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
