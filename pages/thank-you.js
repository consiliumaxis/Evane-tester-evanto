import React, { Fragment } from 'react';
import Head from 'next/head';
import LandingFooter from '../components/landing/LandingFooter';
import { TELEGRAM_URL, SITE_NAME, canonicalFor } from '../lib/seo';

const TITLE = `Thank you — next step | ${SITE_NAME}`;
const DESCRIPTION = 'One last step before joining our Telegram channel.';

export default function ThankYou() {
  return (
    <Fragment>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        {/* Intermediate funnel page — must not be indexed, but should pass link
            juice through internal links and must remain crawlable. */}
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={canonicalFor('/thank-you')} />
      </Head>

      <div className="simple-page">
        <main className="simple-page__main">
          <div className="simple-page__container">
            <p className="simple-page__eyebrow">Almost there</p>
            <h1 className="simple-page__title">Before you open Telegram</h1>
            <p className="simple-page__lead">
              Please read the three steps below. They take 20 seconds and will save you from the most common onboarding mistakes.
            </p>

            <ol className="simple-page__steps">
              <li className="simple-page__step">
                <span className="simple-page__step-num">01</span>
                <p className="simple-page__step-text">
                  <strong>Enable notifications</strong> for the channel so you never miss a live signal. Alerts are time-sensitive.
                </p>
              </li>
              <li className="simple-page__step">
                <span className="simple-page__step-num">02</span>
                <p className="simple-page__step-text">
                  <strong>Pin the channel</strong> to the top of your Telegram chats. Trades move fast — you need the feed visible.
                </p>
              </li>
              <li className="simple-page__step">
                <span className="simple-page__step-num">03</span>
                <p className="simple-page__step-text">
                  <strong>Read the pinned welcome message</strong> first. It explains how the signals are formatted and how to manage risk.
                </p>
              </li>
            </ol>

            <a
              href={TELEGRAM_URL}
              className="cta cta--lg"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="cta-telegram"
            >
              Open Telegram channel
            </a>
          </div>
        </main>
        <LandingFooter />
      </div>
    </Fragment>
  );
}
