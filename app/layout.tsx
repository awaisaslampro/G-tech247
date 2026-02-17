import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTech247 Careers",
  description: "Apply for open positions and track candidates from an admin portal."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
