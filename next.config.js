/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  compiler: {
    // Strip console.* in production builds to shrink the bundle and TBT
    // — the player's catch-blocks already swallow errors silently.
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  async redirects() {
    // /HomePage was a byte-identical duplicate of /. Preserve any existing
    // inbound links with a permanent redirect so we don't drop link equity.
    return [
      { source: '/HomePage',  destination: '/', permanent: true },
      { source: '/HomePage/', destination: '/', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Long-cache static assets in /public/images and /public/videos.
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};
