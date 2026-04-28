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

          {/* ---- Wistia: gestures-only facade defers the entire stack
                  past PSI's scoring window, so we DO NOT preconnect or
                  preload Wistia hosts at HTML parse time — Lighthouse
                  would just flag them "unused" and a real preconnect
                  would also burn TLS/CPU before any of it is needed.
                  dns-prefetch is the cheap warm-up that's safe pre-
                  gesture: zero TLS cost, just a DNS hint. */}
          <link rel="dns-prefetch" href="//fast.wistia.com" />
          <link rel="dns-prefetch" href="//embed-ssl.wistia.com" />
          <link rel="dns-prefetch" href="//distillery.wistia.com" />
          <link rel="dns-prefetch" href="//embedwistia-a.akamaihd.net" />

          {/* ---- LCP hint: only the swatch (the actual <img.vb__poster>
                  the page paints) is preloaded, and only on desktop.
                  Mobile gates this on media="(min-width: 768px)" because
                  cellular cold loads can't afford even ~50 KB of
                  unused-yet-eager image bytes. */}
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
