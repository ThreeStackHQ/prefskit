import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "PrefsKit — Email Preference Center",
    template: "%s | PrefsKit",
  },
  description:
    "Let your subscribers manage their email preferences. One line of code to check if you can send. Built for indie SaaS at $9/mo.",
  keywords: ["email preferences", "unsubscribe", "GDPR", "email marketing", "SaaS"],
  authors: [{ name: "ThreeStack" }],
  creator: "ThreeStack",
  metadataBase: new URL("https://prefskit.io"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prefskit.io",
    title: "PrefsKit — Email Preference Center",
    description: "Manage email preferences in 5 minutes. Built for indie SaaS.",
    siteName: "PrefsKit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrefsKit — Email Preference Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrefsKit — Email Preference Center",
    description: "Manage email preferences in 5 minutes. Built for indie SaaS.",
    images: ["/og-image.png"],
    creator: "@threestack",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
