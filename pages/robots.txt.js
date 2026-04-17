import { SITE_URL } from '../lib/seo';

// Renders robots.txt at /robots.txt. Allows full crawl and points to the
// canonical sitemap. NEXT_PUBLIC_SITE_URL drives the Sitemap URL so we
// never leak localhost or a stale domain.

function buildRobotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.write(buildRobotsTxt());
  res.end();
  return { props: {} };
}

export default function Robots() {
  return null;
}
