import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // O Rabisquinhos agora é a página inicial; links antigos continuam funcionando.
      { source: "/desenho", destination: "/", permanent: false },
      // O ViralLab passou para /virallab.
      { source: "/:page(trending|analyzer|generator|script|strategy)", destination: "/virallab/:page", permanent: false },
    ];
  },
};

export default nextConfig;
