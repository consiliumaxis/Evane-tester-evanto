import { SITE_URL } from '../lib/seo';

// Only lists canonical, really-existing, indexable URLs.
// Right now that's the homepage only.
const URLS = [
  {
    loc: `${SITE_URL}/`,
    changefreq: 'weekly',
    priority: '1.0',
  },
];

function buildSitemap(urls, lastmod) {
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
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
