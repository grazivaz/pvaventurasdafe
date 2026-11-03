import type { Metadata } from "next";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "ViralLab — Canal Dark no YouTube",
  description: "Pesquise tendências, analise fórmulas virais e gere todo o conteúdo do seu canal dark no YouTube.",
};

export default function ViralLabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex-1 flex flex-col bg-gray-950 text-white">
      <Navigation />
      <main className="flex-1">{children}</main>
    </div>
  );
}
