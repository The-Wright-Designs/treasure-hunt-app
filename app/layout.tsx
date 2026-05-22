import type { Metadata } from "next";

import "@/_styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.treasure-hunt-app.com"),
  title: "Treasure Hunt App",
  description: "An exciting treasure hunt application",
  keywords: "treasure hunt, adventure game, scavenger hunt, outdoor activity, treasure hunt app, family fun, exploration game, clue solving, geocaching, interactive adventure, puzzle hunt, team building, location-based game, hidden treasure, quest app",
  openGraph: {
    description: "An exciting treasure hunt application",
    type: "website",
    locale: "en_ZA",
    siteName: "Treasure Hunt App",
    images: [
      {
        url: "/open-graph-image.webp",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Treasure Hunt App",
    url: "https://www.treasure-hunt-app.com",
  };
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
