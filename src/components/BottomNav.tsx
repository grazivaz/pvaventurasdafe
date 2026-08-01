"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CalendarIcon, RepeatIcon } from "@/components/icons";
import { usePerson } from "@/hooks/useClientState";

const ITENS = [
  { href: "/agenda", label: "Agenda", Icon: CalendarIcon },
  { href: "/rotinas", label: "Rotinas", Icon: RepeatIcon },
] as const;

/**
 * Barra fixa no rodapé para ir e voltar entre Agenda e Rotinas. Só aparece
 * depois que a pessoa já escolheu quem é — nas telas internas do app.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { person, hidratado } = usePerson();

  if (!hidratado || !person) return null;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-xl"
      style={{ height: "calc(var(--bottom-nav-h) + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex h-[var(--bottom-nav-h)] w-full max-w-2xl items-stretch px-6">
        {ITENS.map(({ href, label, Icon }) => {
          const ativo = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? "page" : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1"
            >
              <Icon className={`size-6 ${ativo ? "text-brand" : "text-muted"}`} />
              <span
                className={`text-xs font-medium ${ativo ? "text-brand" : "text-muted"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
