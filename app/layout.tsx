import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrayMatter AI — Your firm’s knowledge, connected",
  description: "Private intelligence for firms that run on documents. Find approved knowledge, create cited first drafts, and start with a measured eight-week pilot.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
