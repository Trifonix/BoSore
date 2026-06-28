import type { Metadata } from "next";
import { Suspense } from "react";
import { Orbitron, Exo_2 } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { PageLoadingProvider } from "@/components/layout/PageLoadingProvider";
import "./globals.css";

const display = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"],
});

const body = Exo_2({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "BoSore — Books Sources Store",
  description:
    "Сервис по обмену описаниями книг, статей и оформлениями их как источники для списка литературы",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body>
        <Suspense fallback={<PageLoadingOverlay visible />}>
          <PageLoadingProvider>
            <Header />
            <main className="site-main">{children}</main>
            <Footer />
          </PageLoadingProvider>
        </Suspense>
      </body>
    </html>
  );
}
