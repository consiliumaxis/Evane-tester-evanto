import React from 'react';
import Link from 'next/link';
import { CTA_INTERNAL_HREF } from '../../lib/seo';

// Portrait lives under /public/images/portrait.jpg. The filename is kept
// stable so the image can be swapped without touching code.
const PORTRAIT_SRC = '/images/portrait.webp';

export default function CtaBand() {
  return (
    <section className="cta-band" aria-label="Join">
      <div className="container">
        <div className="cta-band__grid">
          <div className="cta-band__content">
            <span className="eyebrow">Ready to see the desk</span>
            <h2 className="cta-band__title">Join the channel.</h2>
            <div className="cta-band__action">
              <Link href={CTA_INTERNAL_HREF}>
                <a className="cta cta--lg" data-testid="cta-primary">Перейти в Telegram</a>
              </Link>
            </div>
          </div>

          <div className="cta-band__portrait">
            <img
              src={PORTRAIT_SRC}
              alt=""
              className="cta-band__portrait-img"
              loading="lazy"
              decoding="async"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
