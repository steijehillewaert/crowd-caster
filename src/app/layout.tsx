import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crowd Caster · Crowdproductions",
  description: "Extras catalogue for Crowdproductions.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
