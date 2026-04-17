import React, { Fragment } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import LandingFooter from '../components/landing/LandingFooter';

export default function NotFound() {
  return (
    <Fragment>
      <Head>
        <title>Page not found — 404</title>
        <meta name="robots" content="noindex, follow" />
      </Head>

      <div className="simple-page">
        <main className="simple-page__main">
          <div className="simple-page__container error-hero">
            <h1 className="error-hero__code">404</h1>
            <p className="error-hero__title">The page you are looking for does not exist.</p>
            <Link href="/"><a className="cta">Back to home</a></Link>
          </div>
        </main>
        <LandingFooter />
      </div>
    </Fragment>
  );
}
