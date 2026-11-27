import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wimmer — Intelligence Beyond Seasons",
  description: "AI-powered seasonal business intelligence and decision platform for hospitality businesses.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
