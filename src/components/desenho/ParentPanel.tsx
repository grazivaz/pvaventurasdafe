"use client";

import type { Settings } from "./storage";

export type ParentAction = { label: string; icon: string; onClick: () => void; danger?: boolean };

type Props = {
  settings: Settings;
  onChange: (s: Settings) => void;
  actions?: ParentAction[];
  onClose: () => void;
};

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3">
      <span className="font-medium text-gray-800">{label}</span>
      <input
        type="checkbox"
        className="h-6 w-6 accent-orange-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

/** Área dos pais — só abre segurando o cadeado (trava contra toques do bebê). */
export default function ParentPanel({ settings, onChange, actions = [], onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rq-parent-title"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rq-scroll max-h-full w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 text-gray-900 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="rq-parent-title" className="text-xl font-bold">
            👨‍👩‍👧 Área dos pais
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-xl"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {actions.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => {
                  a.onClick();
                  onClose();
                }}
                className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-3 font-semibold ${
                  a.danger ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-800"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {a.icon}
                </span>
                {a.label}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Toggle label="🔊 Sons" checked={settings.sound} onChange={(v) => onChange({ ...settings, sound: v })} />
          <Toggle
            label="🗣️ Falar o nome das cores"
            checked={settings.voice}
            onChange={(v) => onChange({ ...settings, voice: v })}
          />
          <Toggle
            label="⛶ Tela cheia automática"
            checked={settings.fullscreen}
            onChange={(v) => onChange({ ...settings, fullscreen: v })}
          />
        </div>

        <details className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm leading-relaxed text-sky-950">
          <summary className="cursor-pointer font-semibold">🔒 Como travar o tablet/celular no app</summary>
          <p className="mt-2">
            <strong>iPhone/iPad:</strong> Ajustes → Acessibilidade → <em>Acesso Guiado</em>. Abra o app e clique 3
            vezes no botão lateral (ou Início) para travar.
          </p>
          <p className="mt-2">
            <strong>Android:</strong> Configurações → Segurança → <em>Fixar app</em>. Depois, em “Apps recentes”,
            toque no ícone do app e escolha “Fixar”.
          </p>
          <p className="mt-2">
            <strong>Dica:</strong> use “Adicionar à Tela de Início” no navegador para abrir como app, sem barra de
            endereço.
          </p>
        </details>

        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          Sem anúncios, sem cadastro e nada sai do aparelho: os desenhos ficam salvos só neste navegador. A SBP e a OMS
          recomendam evitar telas antes dos 2 anos; se usar, que seja junto com a criança, por poucos minutos,
          conversando sobre as cores e os desenhos.
        </p>
      </div>
    </div>
  );
}
