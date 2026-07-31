"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { CloseIcon } from "@/components/icons";
import { addDays, formatDayLong, nowTime, todayKey, type DayKey } from "@/lib/date";
import { getPerson, personStyle, type PersonId } from "@/lib/people";
import type { NewTaskInput } from "@/lib/task-input";
import {
  CATEGORY_LIST,
  REMINDER_OPTIONS,
  type CategoryId,
  type RemindTarget,
  type Task,
} from "@/lib/types";

type Props = {
  person: PersonId;
  /** Dia sugerido quando se cria uma tarefa nova. */
  defaultDay: DayKey;
  task: Task | null;
  onClose: () => void;
  onCreate: (input: NewTaskInput) => Promise<unknown>;
  onUpdate: (id: string, patch: Record<string, unknown>) => Promise<unknown>;
};

const CAMPO =
  "w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20";

/** Próximo horário "redondo" a partir de agora, para o campo já vir preenchido. */
function horarioSugerido(day: DayKey): string {
  if (day !== todayKey()) return "09:00";
  const [hora, minuto] = nowTime().split(":").map(Number);
  const total = hora * 60 + minuto + 30;
  const arredondado = Math.ceil(total / 30) * 30;
  if (arredondado >= 24 * 60) return "23:30";
  return `${String(Math.floor(arredondado / 60)).padStart(2, "0")}:${String(arredondado % 60).padStart(2, "0")}`;
}

export default function TaskSheet({
  person,
  defaultDay,
  task,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const editando = task !== null;
  const hoje = useMemo(() => todayKey(), []);

  const [title, setTitle] = useState(task?.title ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [category, setCategory] = useState<CategoryId>(task?.category ?? "outro");
  const [date, setDate] = useState<DayKey>(task?.date ?? defaultDay);
  const [diaTodo, setDiaTodo] = useState(task ? task.time === null : false);
  const [time, setTime] = useState(task?.time ?? horarioSugerido(task?.date ?? defaultDay));
  const [remindMinutes, setRemindMinutes] = useState<number | null>(
    task ? task.remindMinutes : 30,
  );
  const [remindTarget, setRemindTarget] = useState<RemindTarget>(task?.remindTarget ?? "todas");

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
      setErro("Escreva o que precisa ser feito.");
      tituloRef.current?.focus();
      return;
    }

    setSalvando(true);
    setErro(null);

    const campos = {
      title: limpo,
      notes: notes.trim(),
      category,
      date,
      time: diaTodo ? null : time,
      remindMinutes,
      remindTarget,
    };

    try {
      if (editando) await onUpdate(task.id, campos);
      else await onCreate({ ...campos, createdBy: person });
      onClose();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não consegui salvar.");
      setSalvando(false);
    }
  }

  const atalhosDeData: { rotulo: string; valor: DayKey }[] = [
    { rotulo: "Hoje", valor: hoje },
    { rotulo: "Amanhã", valor: addDays(hoje, 1) },
    { rotulo: "Depois de amanhã", valor: addDays(hoje, 2) },
  ];

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
        style={personStyle(person)}
        className="person-theme animate-sheet-up relative flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] border border-line bg-surface shadow-[var(--shadow-float)] sm:rounded-[1.75rem]"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              {editando ? "Editar tarefa" : "Nova tarefa"}
            </h2>
            <p className="text-xs text-muted">
              {editando
                ? `Anotada por ${getPerson(task.createdBy).name}`
                : `Vai ficar com a tag de ${getPerson(person).name}`}
            </p>
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
            <label htmlFor="titulo" className="mb-1.5 block text-sm font-medium text-ink-soft">
              O que precisa fazer?
            </label>
            <input
              id="titulo"
              ref={tituloRef}
              value={title}
              onChange={(evento) => setTitle(evento.target.value)}
              maxLength={120}
              placeholder="Ex.: comprar remédio da pressão"
              className={CAMPO}
            />
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Tipo</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_LIST.map((item) => {
                const ativa = item.id === category;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    aria-pressed={ativa}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      ativa
                        ? "border-transparent font-semibold"
                        : "border-line bg-surface-muted text-ink-soft"
                    }`}
                    style={
                      ativa
                        ? { background: "var(--person-tint-strong)", color: "var(--person-text)" }
                        : undefined
                    }
                  >
                    {item.emoji} {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="data" className="mb-1.5 block text-sm font-medium text-ink-soft">
              Quando
            </label>
            <input
              id="data"
              type="date"
              value={date}
              onChange={(evento) => setDate(evento.target.value as DayKey)}
              className={CAMPO}
            />
            <p className="mt-1.5 text-xs text-muted first-letter:uppercase">{formatDayLong(date)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {atalhosDeData.map((atalho) => (
                <button
                  key={atalho.valor}
                  type="button"
                  onClick={() => setDate(atalho.valor)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    date === atalho.valor
                      ? "border-brand bg-brand/12 font-semibold text-brand"
                      : "border-line bg-surface-muted text-ink-soft"
                  }`}
                >
                  {atalho.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="hora" className="text-sm font-medium text-ink-soft">
                Horário
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={diaTodo}
                  onChange={(evento) => setDiaTodo(evento.target.checked)}
                  className="size-4 accent-[var(--person)]"
                />
                dia todo
              </label>
            </div>
            <input
              id="hora"
              type="time"
              value={time}
              disabled={diaTodo}
              onChange={(evento) => setTime(evento.target.value)}
              className={`${CAMPO} disabled:opacity-40`}
            />
            {diaTodo ? (
              <p className="mt-1.5 text-xs text-muted">
                Sem horário marcado: o lembrete usa as 8h da manhã como referência.
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="lembrete" className="mb-1.5 block text-sm font-medium text-ink-soft">
              Me avise
            </label>
            <select
              id="lembrete"
              value={remindMinutes === null ? "nao" : String(remindMinutes)}
              onChange={(evento) =>
                setRemindMinutes(evento.target.value === "nao" ? null : Number(evento.target.value))
              }
              className={CAMPO}
            >
              {REMINDER_OPTIONS.map((opcao) => (
                <option key={String(opcao.value)} value={opcao.value === null ? "nao" : String(opcao.value)}>
                  {opcao.label}
                </option>
              ))}
            </select>

            {remindMinutes !== null ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  [
                    { valor: "todas", rotulo: "Avisar nós duas" },
                    { valor: "somente-eu", rotulo: "Avisar só quem anotou" },
                  ] as { valor: RemindTarget; rotulo: string }[]
                ).map((opcao) => (
                  <button
                    key={opcao.valor}
                    type="button"
                    onClick={() => setRemindTarget(opcao.valor)}
                    aria-pressed={remindTarget === opcao.valor}
                    className={`rounded-2xl border px-3 py-2 text-sm transition ${
                      remindTarget === opcao.valor
                        ? "border-transparent font-semibold"
                        : "border-line bg-surface-muted text-ink-soft"
                    }`}
                    style={
                      remindTarget === opcao.valor
                        ? { background: "var(--person-tint-strong)", color: "var(--person-text)" }
                        : undefined
                    }
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor="obs" className="mb-1.5 block text-sm font-medium text-ink-soft">
              Observação <span className="font-normal text-muted">(opcional)</span>
            </label>
            <textarea
              id="obs"
              value={notes}
              onChange={(evento) => setNotes(evento.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Ex.: levar a receita e o cartão"
              className={`${CAMPO} resize-none`}
            />
          </div>

          {erro ? <p className="text-sm font-medium text-danger">{erro}</p> : null}
        </div>

        <footer className="border-t border-line px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <button
            type="submit"
            disabled={salvando}
            className="w-full rounded-2xl py-3.5 font-semibold text-white shadow-[var(--shadow-card)] transition active:scale-[0.99] disabled:opacity-60"
            style={{ background: "var(--person)" }}
          >
            {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Adicionar à agenda"}
          </button>
        </footer>
      </form>
    </div>
  );
}
