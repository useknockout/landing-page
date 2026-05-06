import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: [
    { path: "../public/fonts/Inter_18pt-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Inter_24pt-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://useknockout.com";
const DESCRIPTION =
  "Drop an image in. Get a transparent PNG out. ~200 ms per call. BiRefNet on Modal GPUs. MIT licensed, self-hostable, 40× cheaper than remove.bg.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "useknockout — background removal API for developers",
    template: "%s · useknockout",
  },
  description: DESCRIPTION,
  applicationName: "useknockout",
  keywords: [
    "background removal",
    "remove background",
    "image API",
    "transparent PNG",
    "BiRefNet",
    "Modal",
    "open source",
    "remove.bg alternative",
  ],
  authors: [{ name: "useknockout" }],
  icons: {
    icon: "/favicon-32.png",
    apple: "/favicon-32.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "useknockout — background removal API for developers",
    description: DESCRIPTION,
    siteName: "useknockout",
    images: [
      {
        url: "/og-card.png",
        width: 1200,
        height: 630,
        alt: "useknockout — background removal API for developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "useknockout — background removal API for developers",
    description: DESCRIPTION,
    images: ["/og-card.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
