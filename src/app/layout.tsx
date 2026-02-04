import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veya Analytics Dashboard",
  description: "Analytics dashboard powered by Next.js and Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
