import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const title = "Selcuk's Web Archive";
const description = "A collection of web pages that I find interesting.";

const images = [{
  url: `https://archive.selcukcihan.com/screenshot.png`,
  width: 360,
  height: 360,
  alt: title,
}]

export const metadata: Metadata = {
  title,
  description,
  keywords: ["web", "archive", "interesting", "pages", "selcuk", "cihan", "gen-ai", "ai", "generated", "content", "tagged"],
  openGraph: {
    siteName: title,
    title: description,
    description,
    type: 'website',
    url: 'https://archive.selcukcihan.com',
    images,
  },
  twitter: {
    site: '@scihan',
    creator: '@scihan',
    card: 'summary',
    title: description,
    description,
    images,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
