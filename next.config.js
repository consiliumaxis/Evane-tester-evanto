/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    // /HomePage was a byte-identical duplicate of /. Preserve any existing
    // inbound links with a permanent redirect so we don't drop link equity.
    // Everything else intentionally 404s (no blanket redirect-to-home).
    return [
      {
        source: '/HomePage',
        destination: '/',
        permanent: true,
      },
      {
        source: '/HomePage/',
        destination: '/',
        permanent: true,
      },
    ];
  },
};
