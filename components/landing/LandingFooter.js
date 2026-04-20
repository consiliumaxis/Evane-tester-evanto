import React from 'react';
import Link from 'next/link';
import { COMPANY, SITE_NAME } from '../../lib/seo';

export default function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__brand-row">
          <span className="footer__brand">{SITE_NAME}</span>
          <span className="footer__brand-sep" aria-hidden="true">|</span>
          <span className="footer__brand-tagline">
            MASTER YOUR MINDSET. MASTER YOUR TRADING.
          </span>
        </div>

        <div className="footer__meta">
          <div className="footer__copy">
            © {year} {COMPANY.legalName}. All rights reserved.
          </div>
          <ul className="footer__links">
            <li><Link href="/terms">Terms &amp; Conditions</Link></li>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><a href={`mailto:${COMPANY.email}`}>Contact</a></li>
          </ul>
        </div>

        <div className="footer__info-grid">
          <address className="footer__info-col">
            <strong>{COMPANY.legalName}</strong><br />
            {COMPANY.address}
          </address>
          <div className="footer__info-col">
            <a href={`tel:${COMPANY.phoneHref}`}>{COMPANY.phone}</a>
            <br />
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          </div>
        </div>

        <div className="footer__disclaimer" aria-label="Risk disclaimer">
          <p>
            If you do not agree with any term or provision of our Terms and Conditions you should not use our Site, Services, Content or Information. Please be advised that your continued use of the Site, Services, Content, or Information provided shall indicate your consent and agreement to our Terms and Conditions.
          </p>
          <p>
            {SITE_NAME} may publish testimonials or descriptions of past performance but these results are NOT typical, are not indicative of future results or performance, and are not intended to be a representation, warranty or guarantee that similar results will be obtained by you.
          </p>
          <p>
            Trading and investing in financial markets involves a high level of risk and may not be suitable for every investor. Past performance is not indicative, and does not guarantee, future results. You may lose some or all of your invested capital.
          </p>
          <p>
            All information presented on this site is for educational and informational purposes only and does not constitute investment advice, a solicitation, or an offer to buy or sell any financial instrument. A referral to a stock, commodity or crypto asset is not an indication to buy or sell that instrument. This does not represent our full disclaimer — please read our complete disclaimer before acting on any content.
          </p>
        </div>
      </div>
    </footer>
  );
}
