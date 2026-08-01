"use client";

import { useEffect, useRef, useState } from "react";

import { CloseIcon } from "@/components/icons";
import type { PersonId } from "@/lib/people";
import type { NewRoutineInput } from "@/lib/routines/input";
import {
  ROUTINE_AREA_LIST,
  ROUTINE_CYCLE_PRESETS,
  type Routine,
  type RoutineAreaId,
} from "@/lib/routines/types";

type Props = {
  person: PersonId;
  routine: Routine | null;
  onClose: () => void;
  onCreate: (input: NewRoutineInput) => Promise<unknown>;
  onUpdate: (id: string, patch: Record<string, unknown>) => Promise<unknown>;
};

const CAMPO =
  "w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function RoutineSheet({ person, routine, onClose, onCreate, onUpdate }: Props) {
  const editando = routine !== null;

  const [title, setTitle] = useState(routine?.title ?? "");
  const [area, setArea] = useState<RoutineAreaId>(routine?.area ?? "casa");
  const [cycleDays, setCycleDays] = useState(routine?.cycleDays ?? 30);
  const [cicloPersonalizado, setCicloPersonalizado] = useState(
    routine !== null &&
      !ROUTINE_CYCLE_PRESETS.includes(routine.cycleDays as (typeof ROUTINE_CYCLE_PRESETS)[number]),
  );

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const tituloRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    tituloRef.current?.focus();

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onClose();
    };
    document.addEventListener("keydown", aoTeclar);

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = anterior;
    };
  }, [onClose]);

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    if (salvando) return;

    const limpo = title.trim();
    if (!limpo) {
      setErro("Dê um nome para a rotina.");
      tituloRef.current?.focus();
      return;
    }
    if (!Number.isInteger(cycleDays) || cycleDays < 1 || cycleDays > 365) {
      setErro("A repetição precisa ser entre 1 e 365 dias.");
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      if (editando) await onUpdate(routine.id, { title: limpo, area, cycleDays });
      else await onCreate({ title: limpo, area, cycleDays, createdBy: person });
      onClose();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não consegui salvar.");
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/45 backdrop-blur-[2px]"
      />

      <form
        onSubmit={salvar}
        className="animate-sheet-up relative flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] border border-line bg-surface shadow-[var(--shadow-float)] sm:rounded-[1.75rem]"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              {editando ? "Editar rotina" : "Nova rotina"}
            </h2>
            <p className="text-xs text-muted">Se repete sozinha a cada ciclo, sem você recriar.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <CloseIcon className="size-5" />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
          <div>
            <label htmlFor="titulo-rotina" className="mb-1.5 block text-sm font-medium text-ink-soft">
              Nome da rotina
            </label>
            <input
              id="titulo-rotina"
              ref={tituloRef}
              value={title}
              onChange={(evento) => setTitle(evento.target.value)}
              maxLength={120}
              placeholder="Ex.: banho dos cachorros"
              className={CAMPO}
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Área</span>
            <div className="flex flex-wrap gap-2">
              {ROUTINE_AREA_LIST.map((item) => {
                const ativa = item.id === area;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setArea(item.id)}
                    aria-pressed={ativa}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      ativa
                        ? "border-transparent bg-brand/12 font-semibold text-brand"
                        : "border-line bg-surface-muted text-ink-soft"
                    }`}
                  >
                    {item.emoji} {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">
              A cada quantos dias se repete
            </span>
            <div className="flex flex-wrap gap-2">
              {ROUTINE_CYCLE_PRESETS.map((dias) => {
                const ativo = !cicloPersonalizado && cycleDays === dias;
                return (
                  <button
                    key={dias}
                    type="button"
                    onClick={() => {
                      setCycleDays(dias);
                      setCicloPersonalizado(false);
                    }}
                    aria-pressed={ativo}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      ativo
                        ? "border-transparent bg-brand/12 font-semibold text-brand"
                        : "border-line bg-surface-muted text-ink-soft"
                    }`}
                  >
                    {dias} dias
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCicloPersonalizado(true)}
                aria-pressed={cicloPersonalizado}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  cicloPersonalizado
                    ? "border-transparent bg-brand/12 font-semibold text-brand"
                    : "border-line bg-surface-muted text-ink-soft"
                }`}
              >
                Outro
              </button>
            </div>

            {cicloPersonalizado ? (
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={cycleDays}
                  onChange={(evento) => setCycleDays(Number(evento.target.value))}
                  className={`${CAMPO} w-28`}
                />
                <span className="text-sm text-muted">dias</span>
              </div>
            ) : null}
          </div>

          {erro ? <p className="text-sm font-medium text-danger">{erro}</p> : null}
        </div>

        <footer className="border-t border-line px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <button
            type="submit"
            disabled={salvando}
            className="w-full rounded-2xl bg-brand py-3.5 font-semibold text-white shadow-[var(--shadow-card)] transition active:scale-[0.99] disabled:opacity-60"
          >
            {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Criar rotina"}
          </button>
        </footer>
      </form>
    </div>
  );
}
