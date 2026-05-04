import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/src/components/layout/Providers";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { ensureSeed } from "@/src/lib/services/seed";

export const metadata: Metadata = {
  title: "Plinth — Marketplace for digital makers",
  description: "Buy and sell digital products. Templates, software, courses, audio, 3D models — instant download.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await ensureSeed();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
