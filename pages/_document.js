import Document, { Html, Head, Main, NextScript } from 'next/document';

const WISTIA_VIDEO_ID = 'ttoixchr7k';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* ---- Fonts: only the four weights actually used on the page.
                  fonts.gstatic.com is the only host worth preconnecting —
                  the .css fetch from fonts.googleapis.com is critical
                  itself, so a preconnect to it is flagged as unused. */}
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
            rel="stylesheet"
          />

          {/* ---- Wistia hints.
                  Bootstrap is delayed past the PSI scoring window on
                  every viewport (see VideoBlock.js — load + ~2 s rIC),
                  so a real preconnect would just be flagged "unused".
                  dns-prefetch is the cheap fallback: zero TLS / CPU
                  cost, but it warms up DNS so the deferred fetch is
                  a touch faster when it finally fires. */}
          <link rel="dns-prefetch" href="//fast.wistia.com" />
          <link rel="dns-prefetch" href="//embed-ssl.wistia.com" />
          <link rel="dns-prefetch" href="//distillery.wistia.com" />
          <link rel="dns-prefetch" href="//embedwistia-a.akamaihd.net" />

          {/* ---- LCP hint: only the swatch image (the actual
                  <img.vb__poster> the page paints) is preloaded, and
                  only on desktop. Mobile cellular skips it to keep
                  the cold load tight. */}
          <link
            rel="preload"
            as="image"
            href={`https://fast.wistia.com/embed/medias/${WISTIA_VIDEO_ID}/swatch`}
            fetchpriority="high"
            media="(min-width: 768px)"
          />

          <meta name="theme-color" content="#0b0e14" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
