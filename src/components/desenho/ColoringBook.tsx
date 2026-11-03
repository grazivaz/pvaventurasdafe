"use client";

import { useEffect, useRef, useState } from "react";
import DrawingSvg from "./DrawingSvg";
import { fillableKeys, type Drawing } from "./drawings";
import { Bursts, Celebration, useBursts } from "./Effects";
import { shareOrDownload, svgToPngBlob } from "./exportImage";
import Palette from "./Palette";
import { COLORS, MAGIC_CYCLE, RAINBOW, colorById } from "./colors";
import { fanfare, pop, speak, tap, vibrate } from "./sound";
import { coloringKey, load, remove, save } from "./storage";
import TopBar, { BarButton } from "./TopBar";
import type { ParentAction } from "./ParentPanel";

type Props = {
  drawing: Drawing;
  onPrev: () => void;
  onNext: () => void;
  onHome: () => void;
  onParent: (actions: ParentAction[]) => void;
};

const WHITE = "#FFFFFF";

function isComplete(drawing: Drawing, colors: Record<string, string>) {
  return fillableKeys(drawing).every((k) => colors[k] && colors[k] !== WHITE);
}

/**
 * Livro de colorir: tocar numa área pinta ela inteira, sempre dentro das
 * linhas. Arrastar o dedo pinta cada área por onde passa. Vários dedos ao
 * mesmo tempo funcionam (bebês usam a mão toda).
 */
export default function ColoringBook({ drawing, onPrev, onNext, onHome, onParent }: Props) {
  const [color, setColor] = useState<string>(RAINBOW);
  const [colors, setColors] = useState<Record<string, string>>(() => load(coloringKey(drawing.id), {}));
  const [canUndo, setCanUndo] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [done, setDone] = useState(() => isComplete(drawing, colors));
  const { bursts, add } = useBursts();

  const svgRef = useRef<SVGSVGElement>(null);
  const colorsRef = useRef(colors);
  const history = useRef<{ key: string; prev: string | undefined }[]>([]);
  const magic = useRef(0);
  const active = useRef(new Map<number, string | null>());
  const celebrateTimer = useRef<number | null>(null);

  useEffect(() => {
    speak(drawing.name);
    return () => {
      if (celebrateTimer.current !== null) window.clearTimeout(celebrateTimer.current);
    };
  }, [drawing.name]);

  const commit = (next: Record<string, string>) => {
    colorsRef.current = next;
    setColors(next);
    save(coloringKey(drawing.id), next);
    setCanUndo(history.current.length > 0);
  };

  const fillAt = (x: number, y: number, pointerId: number, isDown: boolean) => {
    const el = document.elementFromPoint(x, y);
    const key = el?.getAttribute("data-region") ?? null;
    if (!key) return;
    if (!isDown && active.current.get(pointerId) === key) return;
    active.current.set(pointerId, key);

    let hex: string;
    let tone: number;
    if (color === RAINBOW) {
      const c = MAGIC_CYCLE[magic.current % MAGIC_CYCLE.length];
      tone = magic.current;
      magic.current++;
      hex = c.hex;
    } else {
      hex = colorById(color)?.hex ?? WHITE;
      tone = COLORS.findIndex((c) => c.id === color);
    }

    add(x, y, hex);
    pop(tone);
    vibrate();

    const prev = colorsRef.current[key];
    if (prev === hex) return;
    history.current.push({ key, prev });
    if (history.current.length > 200) history.current.shift();
    const next = { ...colorsRef.current, [key]: hex };
    commit(next);

    const complete = isComplete(drawing, next);
    if (complete && !done) {
      setCelebrate(true);
      fanfare();
      window.setTimeout(() => speak("Muito bem!"), 500);
      if (celebrateTimer.current !== null) window.clearTimeout(celebrateTimer.current);
      celebrateTimer.current = window.setTimeout(() => setCelebrate(false), 2800);
    }
    setDone(complete);
  };

  const undo = () => {
    const last = history.current.pop();
    if (!last) return;
    tap();
    const next = { ...colorsRef.current };
    if (last.prev === undefined) delete next[last.key];
    else next[last.key] = last.prev;
    commit(next);
    setDone(isComplete(drawing, next));
  };

  const reset = () => {
    history.current = [];
    remove(coloringKey(drawing.id));
    colorsRef.current = {};
    setColors({});
    setCanUndo(false);
    setDone(false);
  };

  const exportPng = async () => {
    if (!svgRef.current) return;
    const blob = await svgToPngBlob(svgRef.current);
    if (blob) await shareOrDownload(blob, `colorir-${drawing.id}.png`);
  };

  const selectColor = (id: string) => {
    setColor(id);
    tap();
    speak(id === RAINBOW ? "Arco-íris!" : (colorById(id)?.name ?? ""));
  };

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar
        onHome={onHome}
        onParent={() =>
          onParent([
            { label: "Salvar imagem", icon: "💾", onClick: () => void exportPng() },
            { label: "Apagar cores", icon: "🧽", onClick: reset, danger: true },
          ])
        }
      >
        <BarButton label="Desenho anterior" onPress={onPrev}>
          ⬅️
        </BarButton>
        <BarButton label="Desfazer" onPress={undo} disabled={!canUndo}>
          ↩️
        </BarButton>
        <BarButton label="Próximo desenho" onPress={onNext} pulse={done && !celebrate}>
          ➡️
        </BarButton>
      </TopBar>

      <div className="flex min-h-0 flex-1 flex-col landscape:flex-row">
        <div
          className="relative min-h-0 min-w-0 flex-1 p-2 sm:p-4"
          onPointerDown={(e) => {
            e.preventDefault();
            fillAt(e.clientX, e.clientY, e.pointerId, true);
          }}
          onPointerMove={(e) => {
            if (!active.current.has(e.pointerId)) return;
            if (e.buttons === 0) {
              active.current.delete(e.pointerId);
              return;
            }
            fillAt(e.clientX, e.clientY, e.pointerId, false);
          }}
          onPointerUp={(e) => active.current.delete(e.pointerId)}
          onPointerCancel={(e) => active.current.delete(e.pointerId)}
        >
          <DrawingSvg
            ref={svgRef}
            drawing={drawing}
            colors={colors}
            interactive
            className="h-full w-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
          />
        </div>
        <Palette selected={color} onSelect={selectColor} />
      </div>

      <Bursts bursts={bursts} />
      <Celebration show={celebrate} />
    </div>
  );
}
