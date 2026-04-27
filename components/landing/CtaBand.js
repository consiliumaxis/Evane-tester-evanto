import React from 'react';
import Link from 'next/link';
import { CTA_INTERNAL_HREF } from '../../lib/seo';

export default function CtaBand() {
  return (
    <section className="cta-band" aria-label="Join">
      <img
        className="ed-portrait"
        src="/images/portrait.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <div className="container">
        <span className="eyebrow">Ready to see the desk</span>
        <h2 className="cta-band__title">Join the channel.</h2>
        <Link href={CTA_INTERNAL_HREF}>
          <a className="cta cta--lg" data-testid="cta-primary">Перейти в Telegram</a>
        </Link>
      </div>
    </section>
  );
}
