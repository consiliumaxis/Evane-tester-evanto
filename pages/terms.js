import React, { Fragment } from 'react';
import Head from 'next/head';
import LandingFooter from '../components/landing/LandingFooter';
import { COMPANY, SITE_NAME, canonicalFor } from '../lib/seo';

const TITLE = `Terms & Conditions | ${SITE_NAME}`;
const DESCRIPTION = `Terms & Conditions for ${SITE_NAME}.`;

// Placeholder copy — replace with your real, legally-reviewed terms before launch.
export default function Terms() {
  return (
    <Fragment>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalFor('/terms')} />
      </Head>

      <div className="simple-page">
        <main className="simple-page__main">
          <div className="simple-page__container simple-page__body">
            <p className="simple-page__eyebrow">Legal</p>
            <h1 className="simple-page__title">Terms &amp; Conditions</h1>
            <p>
              These terms govern your use of this website and any related services operated by {COMPANY.legalName}.
            </p>
            <p><em>Placeholder content — replace with your reviewed terms before launch.</em></p>

            <h2>1. No investment advice</h2>
            <p>Content published on this website and on our Telegram channel is for educational and informational purposes only. It is not investment, financial, legal or tax advice and must not be relied upon as such.</p>

            <h2>2. Risk acknowledgement</h2>
            <p>Trading financial instruments carries a high level of risk and may not be suitable for every investor. Past performance is not indicative of future results. You may lose some or all of your capital.</p>

            <h2>3. Eligibility</h2>
            <p>You must be of legal age in your jurisdiction to use this service. Access may be restricted in certain countries.</p>

            <h2>4. Intellectual property</h2>
            <p>All content on this site is the property of {COMPANY.legalName} unless otherwise stated. You may not reproduce or redistribute it without prior written consent.</p>

            <h2>5. Liability</h2>
            <p>To the fullest extent permitted by law, {COMPANY.legalName} is not liable for any direct, indirect, incidental or consequential losses arising from your use of the service.</p>

            <h2>6. Contact</h2>
            <p>{COMPANY.legalName}, {COMPANY.address}. Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</p>
          </div>
        </main>
        <LandingFooter />
      </div>
    </Fragment>
  );
}
