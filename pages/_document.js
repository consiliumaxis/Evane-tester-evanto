import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Fonts: trimmed to four weights actually used on the page
              (400 body, 600 eyebrow/CTA/labels, 700 headlines,
              800 hero accent) — drops one font file from initial fetch. */}
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

          {/* Warm up the TLS handshake to Wistia in advance so the lazy
              player boot doesn't pay for it. */}
          <link rel="preconnect" href="https://fast.wistia.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="//fast.wistia.com" />
          <link rel="dns-prefetch" href="//embed-ssl.wistia.com" />
          <link rel="dns-prefetch" href="//embedwistia-a.akamaihd.net" />

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
