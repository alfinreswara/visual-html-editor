import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Visual HTML Editor",
    template: "%s · Visual HTML Editor",
  },
  description:
    "Editor HTML visual dengan preview langsung, panel properti, bantuan AI, dan export ZIP. Project tersimpan di browser.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08080a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh bg-[#08080a] font-sans text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
