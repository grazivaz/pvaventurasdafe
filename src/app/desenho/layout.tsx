import type { Metadata, Viewport } from "next";
import "./desenho.css";

export const metadata: Metadata = {
  title: "Rabisquinhos — colorir e desenhar",
  description: "Desenhos para colorir e tela em branco para bebês e crianças pequenas. Sem anúncios, sem cadastro.",
  manifest: "/desenho.webmanifest",
  applicationName: "Rabisquinhos",
  appleWebApp: { capable: true, title: "Rabisquinhos", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/rabisquinhos-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/rabisquinhos-180.png", sizes: "180x180" }],
  },
};

// Sem zoom de pinça e ocupando a tela toda (inclusive atrás do "notch").
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FFF4DC",
};

export default function DesenhoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
