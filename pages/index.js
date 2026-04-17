import React, { Fragment } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Hero1 from '../components/Hero1';
import Exprience from '../components/exprience';
import AboutHome from '../components/AboutHome';
import PorfolioSectionHome from '../components/PorfolioSectionHome';
import TestSlider from '../components/Testimonial';
import ContactArea from '../components/ContactArea';
import Footer from '../components/Footer';
import {
  SITE_URL,
  SITE_NAME,
  SITE_AUTHOR,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
  canonicalFor,
} from '../lib/seo';

const canonical = canonicalFor('/');

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      inLanguage: 'en',
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: SITE_AUTHOR,
      jobTitle: 'Freelance UI/UX Designer',
      url: `${SITE_URL}/`,
      mainEntityOfPage: `${SITE_URL}/`,
    },
  ],
};

const HomePage = () => {
  return (
    <Fragment>
      <Head>
        <title>{DEFAULT_TITLE}</title>
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="canonical" href={canonical} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={DEFAULT_TITLE} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={DEFAULT_TITLE} />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />

        <link rel="icon" href="/favicon.ico" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <Navbar />
      <Hero1 />
      <Exprience />
      <section id="about">
        <AboutHome />
      </section>
      <section id="portfolio">
        <PorfolioSectionHome />
      </section>
      <TestSlider />
      <section id="contact">
        <ContactArea />
      </section>
      <Footer />
    </Fragment>
  );
};

export default HomePage;
