import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

import "./globals.css";

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SquadLink",
  description: "Plataforma web multijuego para clanes, squads, eventos y LFG.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable} h-full`}>
      <body className="min-h-full bg-black text-white antialiased">
        <Providers>
          <div className="min-h-screen">
            <SiteHeader />
            <main className="mx-auto min-h-[calc(100vh-144px)] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
