import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="description"
          content="Discover authentic Ilkal sarees handwoven with heritage and artistry. Shop curated collections of traditional Indian silk sarees at Parampare."
        />
        <meta name="author" content="Parampare" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

        <meta property="og:title" content="Parampare - Authentic Ilkal Sarees" />
        <meta
          property="og:description"
          content="Discover authentic Ilkal sarees handwoven with heritage and artistry."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stage.paramparee.com/" />
        <meta property="og:image" content="https://stage.paramparee.com/kannada-logo.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Parampare" />
        <meta name="twitter:image" content="https://stage.paramparee.com/kannada-logo.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
