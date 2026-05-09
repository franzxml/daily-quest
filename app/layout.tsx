import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Quest",
  description: "Aplikasi pribadi untuk mencatat dan memantau aktivitas harian."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
