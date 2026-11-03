"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onHold: () => void;
  /** Tempo segurando (ms). Um bebê toca e solta; um adulto segura. */
  duration?: number;
  label: string;
  className?: string;
  children: React.ReactNode;
};

const R = 26;
const CIRC = 2 * Math.PI * R;

/**
 * "Trava para adultos": a ação só acontece segurando o botão por alguns
 * segundos. Toque rápido mostra a dica "segure".
 */
export default function HoldButton({ onHold, duration = 1500, label, className = "", children }: Props) {
  const [holding, setHolding] = useState(false);
  const [hint, setHint] = useState(false);
  const timer = useRef<number | null>(null);
  const hintTimer = useRef<number | null>(null);

  const clear = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(
    () => () => {
      clear();
      if (hintTimer.current !== null) window.clearTimeout(hintTimer.current);
    },
    [],
  );

  const start = (e: React.PointerEvent) => {
    e.stopPropagation();
    clear();
    setHolding(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setHolding(false);
      onHold();
    }, duration);
  };

  const cancel = () => {
    if (timer.current !== null) {
      setHint(true);
      if (hintTimer.current !== null) window.clearTimeout(hintTimer.current);
      hintTimer.current = window.setTimeout(() => setHint(false), 1400);
    }
    clear();
    setHolding(false);
  };

  return (
    <button
      type="button"
      aria-label={`${label} (segure)`}
      title={`${label} — segure`}
      className={`relative grid place-items-center rounded-full bg-white/90 shadow-md active:scale-95 transition-transform ${className}`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onHold();
        }
      }}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 60 60" aria-hidden>
        <circle
          cx="30"
          cy="30"
          r={R}
          fill="none"
          stroke="#FF9500"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={holding ? 0 : CIRC}
          style={{ transition: holding ? `stroke-dashoffset ${duration}ms linear` : "none" }}
        />
      </svg>
      <span className="pointer-events-none relative text-2xl leading-none">{children}</span>
      {hint && (
        <span className="pointer-events-none absolute top-full z-30 mt-2 whitespace-nowrap rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white shadow">
          Segure ⏳
        </span>
      )}
    </button>
  );
}
