import Document, { Html, Head, Main, NextScript } from 'next/document';

const WISTIA_VIDEO_ID = 'ttoixchr7k';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* ---- Fonts: only the four weights actually used on the page. */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
            rel="stylesheet"
          />

          {/* ---- Wistia: warm up TLS to every host the player touches.
                  Lighthouse caps useful preconnects ~4, so we keep it
                  to the four real hostnames. */}
          <link rel="preconnect" href="https://fast.wistia.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://embed-ssl.wistia.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://distillery.wistia.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="//embedwistia-a.akamaihd.net" />

          {/* ---- LCP hint: preload the player's thumbnail (Wistia "swatch"
                  redirect = still image for the chosen media), plus the
                  two scripts the IFrame API will fetch on init.
                  Mobile gets none of these — Wistia is heavy enough that
                  on cellular we'd rather defer the entire fetch tree
                  until the page has finished settling. Desktop only. */}
          <link
            rel="preload"
            as="image"
            href={`https://fast.wistia.com/embed/medias/${WISTIA_VIDEO_ID}/swatch`}
            fetchpriority="high"
            media="(min-width: 768px)"
          />
          <link
            rel="preload"
            as="script"
            href="https://fast.wistia.com/assets/external/E-v1.js"
            media="(min-width: 768px)"
          />
          <link
            rel="preload"
            as="script"
            href={`https://fast.wistia.com/embed/medias/${WISTIA_VIDEO_ID}.jsonp`}
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
