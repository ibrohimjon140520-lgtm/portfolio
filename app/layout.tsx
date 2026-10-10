import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "IBROHIMJON — Creative Developer / Personal Archive",
  description:
    "The personal archive of Ummatillayev Ibrohimjon. Creative development, interactive design and digital experiments, presented through six CCTV-inspired project feeds.",
  openGraph: {
    title: "IBROHIMJON — Designing the unexpected.",
    description:
      "Design, code and motion. The personal archive of Ummatillayev Ibrohimjon.",
    images: ["/projects/nexora.svg"],
  },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
