import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Privacy-First Analytics — Self-Hosted, Lightweight Website Analytics",
  description: "Understand your traffic. Respect your visitors. Zero cookies, zero tracking scripts over 2KB, 100% self-hosted and privacy-friendly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
