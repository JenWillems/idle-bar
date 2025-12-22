import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Idle Bar Game",
  description: "Tap bier, verkoop en upgrade je bar in deze idle game."
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}


