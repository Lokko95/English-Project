import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Платформа изучения английского",
  description: "Дневная подготовка студента и вечерний групповой урок по одним материалам",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen overflow-x-hidden antialiased">{children}</body>
    </html>
  );
}
