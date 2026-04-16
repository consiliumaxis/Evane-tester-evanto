// Central SEO config. Reads the canonical site URL from env so we never
// hardcode localhost or a random domain into canonical/OG tags.
//
// Set NEXT_PUBLIC_SITE_URL in .env (see .env.example).
// The fallback is a clearly non-production placeholder so build never breaks,
// but it is obvious in crawlers/logs that the env var wasn't set.

const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.BASE_URL ||
  'https://example.com';

// strip trailing slash to avoid double slashes when composing URLs
export const SITE_URL = RAW_SITE_URL.replace(/\/+$/, '');

export const SITE_NAME = 'Follio';
export const SITE_AUTHOR = 'John Smith';

export const DEFAULT_TITLE = `${SITE_AUTHOR} — Freelance UI/UX Designer Portfolio`;
export const DEFAULT_DESCRIPTION =
  'Portfolio of John Smith, freelance UI/UX designer. Selected work in product design, illustration and brand direction. Get in touch for new projects.';

export const OG_IMAGE = `${SITE_URL}/images/slider/hero-shape.png`;

export function canonicalFor(path = '/') {
  const p = path.startsWith('/') ? path : `/${path}`;
  // project uses trailingSlash: true
  const withSlash = p.endsWith('/') ? p : `${p}/`;
  return `${SITE_URL}${withSlash}`;
}
