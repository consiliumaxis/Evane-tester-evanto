import React, { Fragment } from 'react';
import Head from 'next/head';
import LandingFooter from '../components/landing/LandingFooter';
import { COMPANY, SITE_NAME, canonicalFor } from '../lib/seo';

const TITLE = `Privacy Policy | ${SITE_NAME}`;
const DESCRIPTION = `Privacy Policy for ${SITE_NAME}.`;

// Placeholder copy — replace with your real, legally-reviewed policy before launch.
export default function PrivacyPolicy() {
  return (
    <Fragment>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalFor('/privacy-policy')} />
      </Head>

      <div className="simple-page">
        <main className="simple-page__main">
          <div className="simple-page__container simple-page__body">
            <p className="simple-page__eyebrow">Legal</p>
            <h1 className="simple-page__title">Privacy Policy</h1>
            <p>
              This privacy policy explains how {COMPANY.legalName} (“we”, “us”) collects, uses and protects information you provide when visiting this website or interacting with our Telegram channel.
            </p>
            <p><em>Placeholder content — replace with your reviewed policy before launch.</em></p>

            <h2>1. Information we collect</h2>
            <p>We collect only the data strictly necessary to operate the service: request metadata from your browser, and any information you voluntarily submit.</p>

            <h2>2. How we use information</h2>
            <p>We use this information to operate and secure the service, to respond to enquiries, and to comply with applicable law.</p>

            <h2>3. Sharing</h2>
            <p>We do not sell personal data. We share data only with processors necessary to operate the service, and only under appropriate contractual safeguards.</p>

            <h2>4. Your rights</h2>
            <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data, and to object to certain processing. Contact us at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</p>

            <h2>5. Contact</h2>
            <p>{COMPANY.legalName}, {COMPANY.address}. Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</p>
          </div>
        </main>
        <LandingFooter />
      </div>
    </Fragment>
  );
}
