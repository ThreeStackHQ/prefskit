import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrefsKit — Email Preference Center",
  description:
    "Let your subscribers manage their email preferences. Built for indie SaaS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
