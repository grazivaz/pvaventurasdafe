"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/virallab", label: "Dashboard", icon: "🏠" },
  { href: "/virallab/trending", label: "Pesquisa Viral", icon: "🔥" },
  { href: "/virallab/analyzer", label: "Analisador", icon: "🔬" },
  { href: "/virallab/generator", label: "Gerador", icon: "⚡" },
  { href: "/virallab/script", label: "Roteiro", icon: "📝" },
  { href: "/virallab/strategy", label: "Estratégia", icon: "🎯" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/virallab" className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="text-white font-bold text-xl tracking-tight">
              Viral<span className="text-red-500">Lab</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                pathname === item.href
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
