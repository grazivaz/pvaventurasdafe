"use client";

import { useCallback, useRef, useState } from "react";

type Burst = { id: number; x: number; y: number; color: string };

/** Estrelinhas que "explodem" onde o dedo tocou — feedback de causa e efeito. */
export function useBursts() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(1);
  const add = useCallback((x: number, y: number, color: string) => {
    const id = nextId.current++;
    setBursts((b) => [...b.slice(-12), { id, x, y, color }]);
    window.setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 700);
  }, []);
  return { bursts, add };
}

const DIRS = Array.from({ length: 8 }, (_, k) => {
  const a = (k * Math.PI) / 4;
  return { dx: Math.cos(a) * 60, dy: Math.sin(a) * 60 };
});

export function Bursts({ bursts }: { bursts: Burst[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden>
      {bursts.map((b) =>
        DIRS.map((d, k) => (
          <span
            key={`${b.id}-${k}`}
            className="rq-particle"
            style={
              {
                left: b.x,
                top: b.y,
                color: b.color === "#FFFFFF" ? "#FFD60A" : b.color,
                "--dx": `${d.dx}px`,
                "--dy": `${d.dy}px`,
              } as React.CSSProperties
            }
          >
            {k % 2 ? "★" : "●"}
          </span>
        )),
      )}
    </div>
  );
}

const CONFETTI_COLORS = ["#FF3B30", "#FF9500", "#FFD60A", "#34C759", "#5AC8FA", "#0A60FF", "#AF52DE", "#FF6FB5"];

/** Festa quando o desenho fica todo colorido. */
export function Celebration({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-live="polite">
      <span className="sr-only">Parabéns!</span>
      {Array.from({ length: 48 }, (_, i) => (
        <span
          key={i}
          className="rq-confetti"
          style={{
            left: `${(i * 37) % 100}%`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i % 12) * 0.08}s`,
            animationDuration: `${1.8 + (i % 5) * 0.25}s`,
            borderRadius: i % 3 === 0 ? "50%" : "3px",
          }}
        />
      ))}
      <div className="rq-bigstar absolute left-1/2 top-1/2 text-[28vmin] leading-none" aria-hidden>
        ⭐
      </div>
    </div>
  );
}
