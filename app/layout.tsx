import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/src/components/layout/Providers";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { ensureSeed } from "@/src/lib/services/seed";

export const metadata: Metadata = {
  title: "DigiMart — Digital Products Marketplace",
  description: "Multi-vendor marketplace for digital products",
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
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
