"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ColoringBook from "./ColoringBook";
import DrawingPad from "./DrawingPad";
import DrawingSvg from "./DrawingSvg";
import { DRAWINGS } from "./drawings";
import { SAVE_PREVIEW_EVENT } from "./exportImage";
import HoldButton from "./HoldButton";
import ParentPanel, { type ParentAction } from "./ParentPanel";
import { configureSound, speak, tap, unlockAudio } from "./sound";
import { DEFAULT_SETTINGS, SETTINGS_KEY, coloringKey, load, save, type Settings } from "./storage";

/** Entrada extra no histórico para o "voltar" do celular não sair do app. */
function guardHistory() {
  try {
    window.history.pushState({ rabisquinhos: true }, "");
  } catch {
    /* ambiente sem histórico (iframe restrito) */
  }
}

type Screen = { name: "home" } | { name: "pick" } | { name: "color"; index: number } | { name: "draw" };

const PREVIEW_SUN = { r0: "#FF9500", r1: "#FFD60A", bg: "#BDE7FF" };

function Home({ onColor, onDraw, onParent }: { onColor: () => void; onDraw: () => void; onParent: () => void }) {
  return (
    <div className="flex h-full w-full flex-col items-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex w-full items-center justify-between">
        <span className="h-12 w-12" aria-hidden />
        <h1 className="rq-title text-center text-3xl font-black tracking-tight sm:text-5xl">
          <span className="text-[#FF3B30]">Ra</span>
          <span className="text-[#FF9500]">bis</span>
          <span className="text-[#34C759]">qui</span>
          <span className="text-[#0A60FF]">nhos</span>
        </h1>
        <HoldButton onHold={onParent} duration={2000} label="Área dos pais" className="h-12 w-12 sm:h-14 sm:w-14">
          🔒
        </HoldButton>
      </div>

      <div className="flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-4 py-4 landscape:flex-row sm:gap-6">
        <button
          type="button"
          onClick={onColor}
          aria-label="Colorir desenhos"
          className="rq-card group flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-[2.5rem] bg-[#FFE27A] p-4 shadow-[0_10px_0_#E8B900] active:translate-y-2 active:shadow-[0_2px_0_#E8B900]"
        >
          <DrawingSvg
            drawing={DRAWINGS[1]}
            colors={PREVIEW_SUN}
            className="pointer-events-none min-h-0 w-full max-w-[60vmin] flex-1 rq-wiggle"
          />
          <span className="text-2xl font-extrabold text-[#7A4B00] sm:text-4xl">🖍️ Colorir</span>
        </button>

        <button
          type="button"
          onClick={onDraw}
          aria-label="Desenhar na tela em branco"
          className="rq-card group flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-[2.5rem] bg-[#A6E3FF] p-4 shadow-[0_10px_0_#5AB7E6] active:translate-y-2 active:shadow-[0_2px_0_#5AB7E6]"
        >
          <svg viewBox="0 0 400 400" className="pointer-events-none min-h-0 w-full max-w-[60vmin] flex-1" aria-hidden>
            <rect x="20" y="20" width="360" height="360" rx="28" fill="#fff" stroke="#2B2B2B" strokeWidth="7" />
            <path
              d="M70 260 C110 120 150 330 200 200 S290 90 330 230"
              fill="none"
              stroke="#FF3B30"
              strokeWidth="26"
              strokeLinecap="round"
              className="rq-draw-path"
            />
            <path
              d="M80 120 Q140 70 190 120"
              fill="none"
              stroke="#34C759"
              strokeWidth="20"
              strokeLinecap="round"
              className="rq-draw-path"
              style={{ animationDelay: ".6s" }}
            />
            <circle cx="300" cy="110" r="34" fill="#FFD60A" stroke="#2B2B2B" strokeWidth="7" />
          </svg>
          <span className="text-2xl font-extrabold text-[#0B4A6E] sm:text-4xl">✏️ Desenhar</span>
        </button>
      </div>
    </div>
  );
}

function Picker({ onPick, onBack, onParent }: { onPick: (i: number) => void; onBack: () => void; onParent: () => void }) {
  const [saved] = useState(() => DRAWINGS.map((d) => load<Record<string, string>>(coloringKey(d.id), {})));
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-2xl shadow-md active:scale-95 sm:h-14 sm:w-14"
        >
          ⬅️
        </button>
        <h2 className="text-xl font-extrabold text-[#7A4B00] sm:text-3xl">Escolha um desenho</h2>
        <HoldButton onHold={onParent} duration={2000} label="Área dos pais" className="h-12 w-12 sm:h-14 sm:w-14">
          🔒
        </HoldButton>
      </div>
      <div className="rq-scroll min-h-0 flex-1 touch-pan-y overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {DRAWINGS.map((d, i) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onPick(i)}
              aria-label={d.name}
              className="rq-card aspect-square rounded-[2rem] bg-white p-3 shadow-[0_8px_0_#E7D7B8] active:translate-y-1.5 active:shadow-[0_2px_0_#E7D7B8]"
            >
              <DrawingSvg drawing={d} colors={saved[i]} className="pointer-events-none h-full w-full" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ToddlerArt() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [settings, setSettings] = useState<Settings>(() =>
    typeof window === "undefined" ? DEFAULT_SETTINGS : { ...DEFAULT_SETTINGS, ...load(SETTINGS_KEY, {}) },
  );
  const [parent, setParent] = useState<ParentAction[] | null>(null);
  const [savePreview, setSavePreview] = useState<string | null>(null);
  const screenRef = useRef(screen);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    configureSound(settings);
  }, [settings]);

  const updateSettings = (s: Settings) => {
    setSettings(s);
    save(SETTINGS_KEY, s);
  };

  // Bloqueia gestos do navegador que tiram a criança do app (zoom de pinça no iOS, menu de toque longo).
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();
    const stopMenu = (e: Event) => {
      if (!(e.target instanceof HTMLImageElement && e.target.dataset.savable)) e.preventDefault();
    };
    const onPreview = (e: Event) => setSavePreview((e as CustomEvent<string>).detail);
    document.addEventListener("gesturestart", stop);
    document.addEventListener("contextmenu", stopMenu);
    window.addEventListener(SAVE_PREVIEW_EVENT, onPreview);
    return () => {
      document.removeEventListener("gesturestart", stop);
      document.removeEventListener("contextmenu", stopMenu);
      window.removeEventListener(SAVE_PREVIEW_EVENT, onPreview);
    };
  }, []);

  // Mantém a tela acesa enquanto brinca.
  const requestWakeLock = useCallback(async () => {
    try {
      const nav = navigator as Navigator & {
        wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
      };
      if (nav.wakeLock && !wakeLock.current) {
        wakeLock.current = await nav.wakeLock.request("screen");
      }
    } catch {
      /* sem suporte */
    }
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && screenRef.current.name !== "home") {
        wakeLock.current = null;
        void requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [requestWakeLock]);

  // Botão/gesto "voltar" do celular: sobe um nível dentro do app em vez de sair.
  useEffect(() => {
    const onPop = () => {
      const cur = screenRef.current;
      if (cur.name === "home") return;
      const up: Screen = cur.name === "color" ? { name: "pick" } : { name: "home" };
      setParent(null);
      setScreen(up);
      if (up.name !== "home") guardHistory();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (next: Screen) => {
    if (next.name !== "home" && !window.history.state?.rabisquinhos) guardHistory();
    setScreen(next);
  };

  const enterPlay = () => {
    unlockAudio();
    tap();
    void requestWakeLock();
    if (settings.fullscreen && !document.fullscreenElement) {
      try {
        document.documentElement.requestFullscreen?.({ navigationUI: "hide" }).catch(() => {});
      } catch {
        /* tela cheia indisponível (iPhone, iframes) */
      }
    }
  };

  const openParent = (actions: ParentAction[] = []) => setParent(actions);

  const goHome = () => {
    tap();
    setScreen({ name: "home" });
  };

  const total = DRAWINGS.length;

  return (
    <div className="rq-root fixed inset-0 select-none overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      {screen.name === "home" && (
        <Home
          onColor={() => {
            enterPlay();
            speak("Colorir!");
            go({ name: "pick" });
          }}
          onDraw={() => {
            enterPlay();
            speak("Desenhar!");
            go({ name: "draw" });
          }}
          onParent={() => openParent()}
        />
      )}

      {screen.name === "pick" && (
        <Picker
          onBack={goHome}
          onPick={(index) => {
            enterPlay();
            go({ name: "color", index });
          }}
          onParent={() => openParent()}
        />
      )}

      {screen.name === "color" && (
        <ColoringBook
          key={DRAWINGS[screen.index].id}
          drawing={DRAWINGS[screen.index]}
          onPrev={() => {
            tap();
            setScreen({ name: "color", index: (screen.index - 1 + total) % total });
          }}
          onNext={() => {
            tap();
            setScreen({ name: "color", index: (screen.index + 1) % total });
          }}
          onHome={() => {
            tap();
            setScreen({ name: "pick" });
          }}
          onParent={openParent}
        />
      )}

      {screen.name === "draw" && <DrawingPad onHome={goHome} onParent={openParent} />}

      {savePreview && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Imagem para salvar"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={savePreview}
            alt="Desenho para salvar"
            data-savable="1"
            className="max-h-[70%] max-w-full rounded-2xl bg-white shadow-2xl"
            style={{ WebkitTouchCallout: "default", userSelect: "auto", touchAction: "auto" }}
          />
          <p className="max-w-sm text-center text-base font-semibold text-white">
            Toque e segure a imagem para salvar ou compartilhar.
          </p>
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(savePreview);
              setSavePreview(null);
            }}
            className="rounded-full bg-white px-6 py-3 font-bold text-gray-900"
          >
            Fechar
          </button>
        </div>
      )}

      {parent && (
        <ParentPanel settings={settings} onChange={updateSettings} actions={parent} onClose={() => setParent(null)} />
      )}
    </div>
  );
}
