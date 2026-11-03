"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bursts, useBursts } from "./Effects";
import { canvasToBlob, shareOrDownload } from "./exportImage";
import Palette from "./Palette";
import { MAGIC_CYCLE, RAINBOW, colorById } from "./palette";
import type { ParentAction } from "./ParentPanel";
import { note, speak, stamp as stampSound, tap, vibrate } from "./sound";
import { PAD_KEY, load, save } from "./storage";
import TopBar, { BarButton } from "./TopBar";

type Line = { t: "l"; w: number; c: string | null; p: number[] }; // p = [x, y, hue, x, y, hue, ...]
type Stamp = { t: "s"; k: number; x: number; y: number; s: number; c: string; r: number };
type Item = Line | Stamp;
type Tool = "brush" | "big" | "stamp";

type Props = {
  onHome: () => void;
  onParent: (actions: ParentAction[]) => void;
};

const BG = "#FFFFFF";
const OUTLINE = "#2B2B2B";
const STAMP_KINDS = 4;

const lineColor = (item: Line, i: number) => item.c ?? `hsl(${item.p[i * 3 + 2] % 360} 95% 55%)`;

function drawSegment(ctx: CanvasRenderingContext2D, item: Line, i: number) {
  const p = item.p;
  ctx.strokeStyle = lineColor(item, i);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = item.w;
  if (i === 0) {
    ctx.beginPath();
    ctx.arc(p[0], p[1], item.w / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(p[(i - 1) * 3], p[(i - 1) * 3 + 1]);
  ctx.lineTo(p[i * 3], p[i * 3 + 1]);
  ctx.stroke();
}

function drawStamp(ctx: CanvasRenderingContext2D, s: Stamp) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.r);
  ctx.scale(s.s, s.s);
  ctx.lineWidth = 0.09;
  ctx.strokeStyle = OUTLINE;
  ctx.fillStyle = s.c;
  ctx.beginPath();
  switch (s.k) {
    case 0: {
      // estrela
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 1 : 0.45;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        if (i === 0) ctx.moveTo(r * Math.cos(a), r * Math.sin(a));
        else ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
      }
      ctx.closePath();
      break;
    }
    case 1: {
      // coração
      ctx.moveTo(0, 0.9);
      ctx.bezierCurveTo(-1.25, 0, -0.75, -1.05, 0, -0.38);
      ctx.bezierCurveTo(0.75, -1.05, 1.25, 0, 0, 0.9);
      ctx.closePath();
      break;
    }
    case 2: {
      // flor
      for (let k = 0; k < 5; k++) {
        const a = (k * 2 * Math.PI) / 5;
        ctx.moveTo(0.55 * Math.cos(a) + 0.42, 0.55 * Math.sin(a));
        ctx.arc(0.55 * Math.cos(a), 0.55 * Math.sin(a), 0.42, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = "#FFD60A";
      ctx.arc(0, 0, 0.34, 0, Math.PI * 2);
      break;
    }
    default: {
      // bolinha com brilho
      ctx.arc(0, 0, 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255,.7)";
      ctx.ellipse(-0.3, -0.32, 0.22, 0.14, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

type Active = { line: Line | null; lastStamp: { x: number; y: number } | null; soundDist: number };

/**
 * Tela em branco: pincel grosso (ou gigante), modo arco-íris e carimbos.
 * Multitoque: cada dedo desenha a sua linha. Cada movimento toca uma nota
 * (mais aguda em cima, mais grave embaixo).
 */
export default function DrawingPad({ onHome, onParent }: Props) {
  const [color, setColor] = useState<string>(RAINBOW);
  const [tool, setTool] = useState<Tool>("brush");
  const [count, setCount] = useState(0);
  const { bursts, add } = useBursts();

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const items = useRef<Item[]>([]);
  const size = useRef({ w: 1, h: 1, dpr: 1 });
  const active = useRef(new Map<number, Active>());
  const hue = useRef(200);
  const saveTimer = useRef<number | null>(null);

  const ctx2d = () => canvasRef.current?.getContext("2d") ?? null;

  const redraw = useCallback(() => {
    const ctx = ctx2d();
    if (!ctx) return;
    const { w, h, dpr } = size.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    for (const it of items.current) {
      if (it.t === "s") drawStamp(ctx, it);
      else for (let i = 0; i < it.p.length / 3; i++) drawSegment(ctx, it, i);
    }
  }, []);

  const persist = useCallback(() => {
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => save(PAD_KEY, items.current), 400);
  }, []);

  useEffect(() => {
    items.current = load<Item[]>(PAD_KEY, []);
    setCount(items.current.length);
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      redraw();
    });
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
        save(PAD_KEY, items.current);
      }
    };
  }, [redraw]);

  const base = () => Math.min(size.current.w, size.current.h);
  const brushWidth = () =>
    tool === "big" ? Math.max(30, Math.min(90, base() * 0.085)) : Math.max(14, Math.min(40, base() * 0.035));
  const stampSize = () => Math.max(28, Math.min(90, base() * 0.075)) * (0.85 + Math.random() * 0.35);

  const currentHex = () => {
    if (color !== RAINBOW) return colorById(color)?.hex ?? OUTLINE;
    return MAGIC_CYCLE[Math.floor(Math.random() * MAGIC_CYCLE.length)].hex;
  };

  const point = (e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) };
  };

  const placeStamp = (x: number, y: number, clientX: number, clientY: number) => {
    const ctx = ctx2d();
    if (!ctx) return;
    const s: Stamp = {
      t: "s",
      k: Math.floor(Math.random() * STAMP_KINDS),
      x,
      y,
      s: Math.round(stampSize()),
      c: currentHex(),
      r: Math.round((Math.random() - 0.5) * 60) / 100,
    };
    items.current.push(s);
    drawStamp(ctx, s);
    add(clientX, clientY, s.c);
    stampSound();
    vibrate();
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { x, y } = point(e);
    if (tool === "stamp") {
      placeStamp(x, y, e.clientX, e.clientY);
      active.current.set(e.pointerId, { line: null, lastStamp: { x, y }, soundDist: 0 });
    } else {
      const line: Line = {
        t: "l",
        w: Math.round(brushWidth()),
        c: color === RAINBOW ? null : (colorById(color)?.hex ?? OUTLINE),
        p: [x, y, Math.round(hue.current)],
      };
      items.current.push(line);
      const ctx = ctx2d();
      if (ctx) drawSegment(ctx, line, 0);
      note(1 - y / size.current.h);
      active.current.set(e.pointerId, { line, lastStamp: null, soundDist: 0 });
    }
    setCount(items.current.length);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const a = active.current.get(e.pointerId);
    if (!a) return;
    if (e.buttons === 0) {
      onUp(e);
      return;
    }
    const ctx = ctx2d();
    if (!ctx) return;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    for (const ev of events.length ? events : [e.nativeEvent]) {
      const { x, y } = point(ev);
      if (a.lastStamp) {
        const minGap = base() * 0.11;
        if (Math.hypot(x - a.lastStamp.x, y - a.lastStamp.y) > minGap) {
          placeStamp(x, y, ev.clientX, ev.clientY);
          a.lastStamp = { x, y };
        }
        continue;
      }
      const line = a.line!;
      const n = line.p.length / 3;
      const dist = Math.hypot(x - line.p[(n - 1) * 3], y - line.p[(n - 1) * 3 + 1]);
      if (dist < 2) continue;
      hue.current = (hue.current + dist * 0.5) % 360;
      line.p.push(x, y, Math.round(hue.current));
      drawSegment(ctx, line, n);
      a.soundDist += dist;
      if (a.soundDist > 80) {
        a.soundDist = 0;
        note(1 - y / size.current.h);
      }
    }
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!active.current.delete(e.pointerId)) return;
    setCount(items.current.length);
    persist();
  };

  const undo = () => {
    if (active.current.size > 0 || items.current.length === 0) return;
    items.current.pop();
    tap();
    redraw();
    setCount(items.current.length);
    persist();
  };

  const clearAll = () => {
    items.current = [];
    active.current.clear();
    redraw();
    setCount(0);
    persist();
  };

  const exportPng = async () => {
    if (!canvasRef.current) return;
    const blob = await canvasToBlob(canvasRef.current);
    if (blob) await shareOrDownload(blob, `desenho-${new Date().toISOString().slice(0, 10)}.png`);
  };

  const selectColor = (id: string) => {
    setColor(id);
    tap();
    speak(id === RAINBOW ? "Arco-íris!" : (colorById(id)?.name ?? ""));
  };

  const selectTool = (t: Tool) => {
    setTool(t);
    tap();
  };

  const swatch = color === RAINBOW ? "conic-gradient(#FF3B30,#FFD60A,#34C759,#0A60FF,#AF52DE,#FF3B30)" : colorById(color)?.hex;

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar
        onHome={onHome}
        onParent={() =>
          onParent([
            { label: "Salvar imagem", icon: "💾", onClick: () => void exportPng() },
            { label: "Página nova", icon: "📄", onClick: clearAll, danger: true },
          ])
        }
      >
        <BarButton label="Pincel" active={tool === "brush"} onPress={() => selectTool("brush")}>
          <span className="block h-4 w-4 rounded-full sm:h-5 sm:w-5" style={{ background: swatch }} />
        </BarButton>
        <BarButton label="Pincel gigante" active={tool === "big"} onPress={() => selectTool("big")}>
          <span className="block h-8 w-8 rounded-full sm:h-10 sm:w-10" style={{ background: swatch }} />
        </BarButton>
        <BarButton label="Carimbos" active={tool === "stamp"} onPress={() => selectTool("stamp")}>
          ⭐
        </BarButton>
        <BarButton label="Desfazer" onPress={undo} disabled={count === 0}>
          ↩️
        </BarButton>
      </TopBar>

      <div className="flex min-h-0 flex-1 flex-col landscape:flex-row">
        <div className="min-h-0 min-w-0 flex-1 p-2 sm:p-4">
          <div
            ref={wrapRef}
            className="relative h-full w-full overflow-hidden rounded-3xl bg-white shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
          >
            <canvas
              ref={canvasRef}
              aria-label="Tela para desenhar"
              className="absolute inset-0 h-full w-full"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            />
          </div>
        </div>
        <Palette selected={color} onSelect={selectColor} />
      </div>

      <Bursts bursts={bursts} />
    </div>
  );
}
