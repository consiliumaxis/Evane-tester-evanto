import React from 'react';

export default function RiskDisclaimer() {
  return (
    <section className="risk" aria-label="Risk disclaimer">
      <div className="container">
        <div className="risk__inner" role="note">
          <p className="risk__label">Risk disclaimer</p>
          <h2 className="risk__title">Trading carries substantial risk</h2>
          <p className="risk__text">
            All information presented on this site is for educational and informational purposes only and does not constitute investment advice, a solicitation, or an offer to buy or sell any financial instrument. Trading and investing in financial markets involve a high level of risk and may not be suitable for every investor. Past performance is not indicative, and does not guarantee, future results. You may lose some or all of your invested capital. Before acting on any information you should consider your objectives, financial situation, and needs, and seek independent professional advice where appropriate.
          </p>
        </div>
      </div>
    </section>
  );
}
