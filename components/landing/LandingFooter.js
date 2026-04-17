import React from 'react';
import Link from 'next/link';
import { COMPANY, LEGAL_PAGES, SITE_NAME } from '../../lib/seo';

export default function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
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
