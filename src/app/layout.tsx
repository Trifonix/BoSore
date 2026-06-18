import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
