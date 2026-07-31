"use client";

import { BellIcon } from "@/components/icons";
import { useIsIphone, useIsStandalone } from "@/hooks/useClientState";
import { usePush } from "@/hooks/usePush";
import type { PersonId } from "@/lib/people";

type Props = { person: PersonId };

const CARTAO =
  "rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow-card)]";

/** Explica e liga as notificações do celular. */
export default function AlertsCard({ person }: Props) {
  const { status, ocupado, erro, ativar, desativar, testar } = usePush(person);
  const iphone = useIsIphone();
  const instalado = useIsStandalone();

  if (status === "verificando") return null;

  if (status === "ativo") {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5 font-medium text-success">
          <BellIcon className="size-3.5" />
          Alertas ligados neste aparelho
        </span>
        <button
          type="button"
          onClick={testar}
          disabled={ocupado}
          className="underline underline-offset-2 transition hover:text-ink"
        >
          testar
        </button>
        <button
          type="button"
          onClick={desativar}
          disabled={ocupado}
          className="underline underline-offset-2 transition hover:text-ink"
        >
          desligar
        </button>
        {erro ? <span className="w-full text-danger">{erro}</span> : null}
      </div>
    );
  }

  if (status === "indisponivel" && iphone && !instalado) {
    return (
      <div className={CARTAO}>
        <h2 className="font-display text-base font-semibold text-ink">
          📲 Para receber alertas no iPhone
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          Toque em <strong>Compartilhar</strong> na barra do Safari e depois em{" "}
          <strong>Adicionar à Tela de Início</strong>. Abra a agenda por esse ícone e o botão de
          ativar alertas aparece aqui.
        </p>
      </div>
    );
  }

  if (status === "indisponivel") {
    return (
      <div className={CARTAO}>
        <h2 className="font-display text-base font-semibold text-ink">Alertas indisponíveis</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          Este navegador não envia notificações. Com a agenda aberta, o lembrete ainda aparece na
          tela e toca um som.
        </p>
      </div>
    );
  }

  if (status === "bloqueado") {
    return (
      <div className={CARTAO}>
        <h2 className="font-display text-base font-semibold text-ink">Notificações bloqueadas</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          O navegador está bloqueando os avisos deste site. Abra as configurações do site (o
          cadeado na barra de endereço) e permita notificações.
        </p>
      </div>
    );
  }

  return (
    <div className={`${CARTAO} flex items-center gap-4`}>
      <span className="animate-pulse-ring flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-white">
        <BellIcon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-base font-semibold text-ink">Ativar alertas</h2>
        <p className="mt-0.5 text-sm leading-snug text-ink-soft">
          Receba o aviso no celular na hora da tarefa, mesmo com o app fechado.
        </p>
        {erro ? <p className="mt-1 text-sm text-danger">{erro}</p> : null}
      </div>
      <button
        type="button"
        onClick={ativar}
        disabled={ocupado}
        className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-60"
      >
        {ocupado ? "…" : "Ativar"}
      </button>
    </div>
  );
}
