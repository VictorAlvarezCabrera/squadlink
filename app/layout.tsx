import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

import "./globals.css";

const sans = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SquadLink",
  description: "Red social gamer para descubrir jugadores compatibles, clanes, Busco grupo (LFG) y estadisticas enlazadas.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable} h-full`}>
      <body className="min-h-full bg-slate-950 text-slate-50 antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <a
              href="#contenido-principal"
              className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-cyan-300 focus:px-3 focus:py-2 focus:text-slate-950"
            >
              Saltar al contenido principal
            </a>
            <SiteHeader />
            <main id="contenido-principal" className="mx-auto w-full max-w-7xl flex-1 min-h-[calc(100vh-132px)] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
