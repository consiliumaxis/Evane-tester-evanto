import { SITE_URL, LEGAL_PAGES } from '../lib/seo';

// Only indexable URLs. /thank-you is intentionally excluded (noindex funnel page).
const URLS = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  ...LEGAL_PAGES.map((l) => ({
    path: l.path,
    changefreq: 'yearly',
    priority: '0.3',
  })),
];

function buildSitemap(urls, lastmod) {
  const body = urls
    .map((u) => {
      const withSlash = u.path.endsWith('/') ? u.path : `${u.path}/`;
      return `  <url>
    <loc>${SITE_URL}${withSlash}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export async function getServerSideProps({ res }) {
  const lastmod = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.write(buildSitemap(URLS, lastmod));
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
