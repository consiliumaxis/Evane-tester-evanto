// Central config: SEO + company / compliance placeholders.
// Every value marked __REPLACE__ should be swapped for real production copy
// before launch (see README / PR description).

const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.BASE_URL ||
  'https://example.com';

export const SITE_URL = RAW_SITE_URL.replace(/\/+$/, '');

// Brand
export const SITE_NAME = 'Evanto Trading'; // __REPLACE__
export const SITE_TAGLINE = 'Premium market intelligence'; // __REPLACE__

// Page copy — homepage
export const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const DEFAULT_DESCRIPTION =
  'Watch the strategy, join our Telegram. Real-time trading signals and market commentary curated by the Evanto desk.'; // __REPLACE__

// Social / OG
export const OG_IMAGE = `${SITE_URL}/images/og.jpg`; // __REPLACE__ with a real 1200x630 image

// CTA routing — NOT a direct Telegram link; user goes to /thank-you first.
export const CTA_INTERNAL_HREF = '/thank-you';

// Final Telegram destination — used only on the /thank-you page.
export const TELEGRAM_URL = 'https://t.me/YOUR_CHANNEL'; // __REPLACE__

// Company / compliance
export const COMPANY = {
  legalName: 'Evanto Holdings Ltd.', // __REPLACE__
  address: '1 Example Street, Suite 100, London EC1A 1AA, United Kingdom', // __REPLACE__
  phone: '+44 20 0000 0000', // __REPLACE__
  phoneHref: '+442000000000', // __REPLACE__ — digits + country code for tel:
  email: 'contact@evanto.example', // __REPLACE__
};

// Legal pages visibility
export const LEGAL_PAGES = [
  { path: '/privacy-policy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms & Conditions' },
];

export function canonicalFor(path = '/') {
  const p = path.startsWith('/') ? path : `/${path}`;
  const withSlash = p.endsWith('/') ? p : `${p}/`;
  return `${SITE_URL}${withSlash}`;
}
