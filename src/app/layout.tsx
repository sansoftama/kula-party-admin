import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { AppShell } from "@/components/app-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kula Party Admin",
    template: "%s · Kula Party Admin",
  },
  description: "Operations console for Kula Party. Reads kula-party-backend /v1/admin.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-100 text-zinc-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
