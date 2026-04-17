import React from 'react';
import Link from 'next/link';
import { CTA_INTERNAL_HREF } from '../../lib/seo';

export default function CtaBand() {
  return (
    <section className="cta-band" aria-label="Join">
      <div className="container">
        <h2 className="cta-band__title">
          Ready to see the next trade?
        </h2>
        <Link href={CTA_INTERNAL_HREF}>
          <a className="cta" data-testid="cta-secondary">Перейти в Telegram</a>
        </Link>
      </div>
    </section>
  );
}
