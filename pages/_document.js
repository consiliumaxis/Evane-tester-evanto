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
                  Desktop is on a gesture-facade — Wistia isn't fetched
                  until the user moves / scrolls / taps, so we only
                  drop dns-prefetch hints (zero TLS cost). Mobile boots
                  Wistia eagerly right after first paint, so it benefits
                  from a real preconnect to fast.wistia.com — gated by
                  media="(max-width: 767px)" so it only fires on the
                  viewport that needs it. */}
          <link rel="dns-prefetch" href="//fast.wistia.com" />
          <link rel="dns-prefetch" href="//embed-ssl.wistia.com" />
          <link rel="dns-prefetch" href="//distillery.wistia.com" />
          <link rel="dns-prefetch" href="//embedwistia-a.akamaihd.net" />
          <link
            rel="preconnect"
            href="https://fast.wistia.com"
            crossOrigin="anonymous"
            media="(max-width: 767px)"
          />

          {/* ---- LCP hint: the swatch image (the actual <img.vb__poster>
                  the page paints). Only desktop preloads it because the
                  desktop facade has nothing else competing for the LCP
                  slot. Mobile boots the iframe immediately so the static
                  poster is barely visible — preloading it on cellular
                  would just waste bytes. */}
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
