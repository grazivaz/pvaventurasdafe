"use client";

import { personStyle, type PersonId } from "@/lib/people";

export type Toast = {
  id: number;
  text: string;
  person?: PersonId;
};

type Props = {
  toasts: Toast[];
  onDismiss: (id: number) => void;
};

export default function Toasts({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[max(7rem,calc(env(safe-area-inset-bottom)+7rem))] z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => onDismiss(toast.id)}
          style={toast.person ? personStyle(toast.person) : undefined}
          className="person-theme animate-rise pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-full border border-line bg-surface py-2.5 pl-3 pr-4 text-left text-sm text-ink shadow-[var(--shadow-float)]"
        >
          {toast.person ? (
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: "var(--person)" }}
            />
          ) : null}
          <span className="line-clamp-2">{toast.text}</span>
        </button>
      ))}
    </div>
  );
}
