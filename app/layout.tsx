import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HornExchange AI",
  description: "A UT-only campus concierge for finding trusted student services fast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
