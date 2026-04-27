import React from 'react';

// Decorative trading-chart backdrop. Pure SVG, layered absolutely behind
// the headline text — it never affects layout, never receives clicks, and
// never reflows. Tuned so the right side reads as a calm bullish chart
// while the left side fades out so the centered headline stays clean.
function HeroChart() {
  // Each candle: x position (px in viewBox), open / close / high / low (y).
  // Spread across the full 0–800 viewBox width so the chart reads as a
  // continuous market backdrop, not a corner accent.
  const candles = [
    { x: 20,  o: 240, c: 248, h: 235, l: 252 },
    { x: 50,  o: 248, c: 234, h: 230, l: 252 },
    { x: 80,  o: 234, c: 240, h: 230, l: 244 },
    { x: 110, o: 240, c: 226, h: 222, l: 244 },
    { x: 140, o: 226, c: 232, h: 222, l: 236 },
    { x: 170, o: 232, c: 220, h: 216, l: 236 },
    { x: 200, o: 220, c: 224, h: 216, l: 228 },
    { x: 230, o: 224, c: 212, h: 208, l: 228 },
    { x: 260, o: 212, c: 218, h: 208, l: 222 },
    { x: 290, o: 218, c: 204, h: 200, l: 222 },
    { x: 320, o: 204, c: 210, h: 200, l: 214 },
    { x: 350, o: 210, c: 196, h: 192, l: 214 },
    { x: 380, o: 196, c: 200, h: 192, l: 204 },
    { x: 410, o: 200, c: 188, h: 184, l: 204 },
    { x: 440, o: 188, c: 192, h: 184, l: 196 },
    { x: 470, o: 192, c: 178, h: 174, l: 196 },
    { x: 500, o: 178, c: 184, h: 174, l: 188 },
    { x: 530, o: 184, c: 168, h: 162, l: 188 },
    { x: 560, o: 168, c: 174, h: 162, l: 178 },
    { x: 590, o: 174, c: 156, h: 150, l: 178 },
    { x: 620, o: 156, c: 162, h: 150, l: 166 },
    { x: 650, o: 162, c: 146, h: 142, l: 166 },
    { x: 680, o: 146, c: 152, h: 142, l: 156 },
    { x: 710, o: 152, c: 134, h: 128, l: 156 },
    { x: 740, o: 134, c: 140, h: 128, l: 144 },
    { x: 770, o: 140, c: 122, h: 116, l: 146 },
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
