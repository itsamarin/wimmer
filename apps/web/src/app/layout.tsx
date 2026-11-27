import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wimmer POS — Smart Procurement via idealo.de",
  description: "The hospitality POS that detects what you need and always reorders via idealo.de — at the best market price.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
