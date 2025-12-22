import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Idle Bar Game",
  description: "Tap beer, sell drinks, and upgrade your bar in this idle game."
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


