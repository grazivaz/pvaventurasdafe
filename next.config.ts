import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera `.next/standalone`, com só o necessário para rodar em container.
  output: "standalone",
  // Bibliotecas de servidor que não devem ser empacotadas pelo bundler.
  serverExternalPackages: ["web-push", "pg"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
