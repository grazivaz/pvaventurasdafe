"use client";

import { COLORS, RAINBOW } from "./colors";

type Props = {
  selected: string;
  onSelect: (id: string) => void;
};

const RAINBOW_BG =
  "conic-gradient(#FF3B30, #FF9500, #FFD60A, #34C759, #5AC8FA, #0A60FF, #AF52DE, #FF6FB5, #FF3B30)";

/** Paleta de bolinhas grandes: 6x2 em pé (embaixo), 2x6 deitado (na lateral). */
export default function Palette({ selected, onSelect }: Props) {
  const items = [{ id: RAINBOW, hex: "", name: "Arco-íris mágico" }, ...COLORS];
  return (
    <div
      className="grid shrink-0 grid-cols-6 grid-rows-2 place-items-center gap-2.5 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] landscape:grid-cols-2 landscape:pr-[max(0.75rem,env(safe-area-inset-right))] landscape:grid-rows-6"
      role="radiogroup"
      aria-label="Cores"
    >
      {items.map((c) => {
        const active = selected === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.name}
            onPointerDown={(e) => {
              e.preventDefault();
              onSelect(c.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(c.id);
            }}
            className="rounded-full transition-transform duration-150"
            style={{
              width: "var(--dot)",
              height: "var(--dot)",
              background: c.id === RAINBOW ? RAINBOW_BG : c.hex,
              transform: active ? "scale(1.06)" : "scale(1)",
              boxShadow: active
                ? "0 0 0 3px #fff, 0 0 0 6px #2B2B2B, 0 6px 14px rgba(0,0,0,.25)"
                : "inset 0 -5px 0 rgba(0,0,0,.15), 0 3px 8px rgba(0,0,0,.18)",
              border: c.id === "white" ? "3px solid #ddd" : "none",
            }}
          >
            {c.id === RAINBOW && (
              <span className="pointer-events-none text-[calc(var(--dot)*0.45)] leading-none" aria-hidden>
                ✨
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
