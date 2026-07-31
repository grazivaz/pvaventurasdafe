import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Agenda — Julyana & Grazielle",
  description: "As tarefas da semana das duas, com lembrete no celular na hora certa.",
  applicationName: "Agenda",
  appleWebApp: {
    capable: true,
    title: "Agenda",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4fa" },
    { media: "(prefers-color-scheme: dark)", color: "#100d18" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${fraunces.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
