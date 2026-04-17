import React from 'react';
import Link from 'next/link';
import { COMPANY, LEGAL_PAGES, SITE_NAME } from '../../lib/seo';

export default function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__risk" role="note" aria-label="Risk disclaimer">
          <p className="footer__risk-label">Risk disclaimer</p>
          <h2 className="footer__risk-title">Trading carries substantial risk</h2>
          <p className="footer__risk-text">
            All information presented on this site is for educational and informational purposes only and does not constitute investment advice, a solicitation, or an offer to buy or sell any financial instrument. Trading and investing in financial markets involve a high level of risk and may not be suitable for every investor. Past performance is not indicative, and does not guarantee, future results. You may lose some or all of your invested capital. Before acting on any information you should consider your objectives, financial situation, and needs, and seek independent professional advice where appropriate.
          </p>
        </div>

        <div className="footer__grid">
          <div>
            <div className="footer__brand">{SITE_NAME}</div>
            <address>
              <strong>{COMPANY.legalName}</strong><br />
              {COMPANY.address}
            </address>
          </div>

          <div className="footer__contact">
            <div className="footer__heading">Contact</div>
            <p>
              <a href={`tel:${COMPANY.phoneHref}`}>{COMPANY.phone}</a>
            </p>
            <p>
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </p>
          </div>

          <div>
            <div className="footer__heading">Legal</div>
            <ul className="footer__legal-links">
              {LEGAL_PAGES.map((l) => (
                <li key={l.path}>
                  <Link href={l.path}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} {COMPANY.legalName}. All rights reserved.</span>
          <span>For informational purposes only. Not investment advice.</span>
        </div>
      </div>
    </footer>
  );
}
