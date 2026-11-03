// Desenhos para colorir. Cada desenho é um SVG 400x400 feito de poucas áreas
// GRANDES e fechadas — pensado para o dedinho (impreciso) de uma criança de 1 ano.
//
// - Formas "fill" são áreas coloríveis (recebem cor ao tocar).
// - Formas "fixed" têm cor fixa (olhos, detalhes) e não recebem toque.
// - Formas "line" são só contorno (sorriso, bigodes) e não recebem toque.

export type ShapeGeom =
  | { kind: "path"; d: string }
  | { kind: "circle"; cx: number; cy: number; r: number }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number; rotate?: number }
  | { kind: "rect"; x: number; y: number; w: number; h: number; rx?: number };

export type Shape = ShapeGeom & { role: "fill" | "fixed" | "line"; color?: string };

export type Drawing = {
  id: string;
  name: string;
  shapes: Shape[];
};

const fill = (g: ShapeGeom): Shape => ({ ...g, role: "fill" });
const fixed = (g: ShapeGeom, color = "#2B2B2B"): Shape => ({ ...g, role: "fixed", color });
const line = (d: string): Shape => ({ kind: "path", d, role: "line" });

const path = (d: string): ShapeGeom => ({ kind: "path", d });
const circle = (cx: number, cy: number, r: number): ShapeGeom => ({ kind: "circle", cx, cy, r });
const ellipse = (cx: number, cy: number, rx: number, ry: number, rotate?: number): ShapeGeom => ({
  kind: "ellipse",
  cx,
  cy,
  rx,
  ry,
  rotate,
});
const rect = (x: number, y: number, w: number, h: number, rx?: number): ShapeGeom => ({
  kind: "rect",
  x,
  y,
  w,
  h,
  rx,
});

const r1 = (n: number) => Math.round(n * 10) / 10;

function starPath(cx: number, cy: number, outer: number, inner: number, points = 5): string {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    d += `${i === 0 ? "M" : "L"}${r1(cx + r * Math.cos(a))} ${r1(cy + r * Math.sin(a))} `;
  }
  return d + "Z";
}

function sunRays(cx: number, cy: number, base: number, tip: number, count = 8): string {
  let d = "";
  for (let k = 0; k < count; k++) {
    const a = (k * 2 * Math.PI) / count;
    const a1 = a - 0.24;
    const a2 = a + 0.24;
    d +=
      `M${r1(cx + base * Math.cos(a1))} ${r1(cy + base * Math.sin(a1))} ` +
      `L${r1(cx + tip * Math.cos(a))} ${r1(cy + tip * Math.sin(a))} ` +
      `L${r1(cx + base * Math.cos(a2))} ${r1(cy + base * Math.sin(a2))} Z `;
  }
  return d.trim();
}

function rainbowBand(cx: number, cy: number, outer: number, inner: number): string {
  return (
    `M${cx - outer} ${cy} A${outer} ${outer} 0 0 1 ${cx + outer} ${cy} ` +
    `L${cx + inner} ${cy} A${inner} ${inner} 0 0 0 ${cx - inner} ${cy} Z`
  );
}

function flowerPetals(cx: number, cy: number, dist: number, count = 6): Shape[] {
  return Array.from({ length: count }, (_, k) => {
    const deg = -90 + (k * 360) / count;
    const a = (deg * Math.PI) / 180;
    return fill(ellipse(r1(cx + dist * Math.cos(a)), r1(cy + dist * Math.sin(a)), 48, 33, deg));
  });
}

export const DRAWINGS: Drawing[] = [
  {
    id: "bola",
    name: "Bola",
    shapes: [
      fill(path("M200 60 A140 140 0 0 0 200 340 C120 290 120 110 200 60 Z")),
      fill(path("M200 60 C120 110 120 290 200 340 C280 290 280 110 200 60 Z")),
      fill(path("M200 60 A140 140 0 0 1 200 340 C280 290 280 110 200 60 Z")),
    ],
  },
  {
    id: "sol",
    name: "Sol",
    shapes: [
      fill(path(sunRays(200, 200, 104, 182))),
      fill(circle(200, 200, 96)),
      fixed(circle(165, 182, 11)),
      fixed(circle(235, 182, 11)),
      line("M155 222 Q200 268 245 222"),
    ],
  },
  {
    id: "maca",
    name: "Maçã",
    shapes: [
      fill(path("M192 128 L198 58 L216 60 L210 130 Z")),
      fill(path("M212 92 C240 52 292 50 306 72 C284 106 240 112 212 92 Z")),
      fill(
        path(
          "M200 126 C150 86 66 104 66 205 C66 305 140 355 200 334 C260 355 334 305 334 205 C334 104 250 86 200 126 Z",
        ),
      ),
    ],
  },
  {
    id: "estrela",
    name: "Estrela",
    shapes: [
      fill(path(starPath(200, 218, 168, 74))),
      fill(path(starPath(62, 62, 40, 17))),
      fill(path(starPath(342, 70, 34, 15))),
      fixed(circle(176, 210, 10)),
      fixed(circle(224, 210, 10)),
      line("M176 246 Q200 270 224 246"),
    ],
  },
  {
    id: "peixe",
    name: "Peixe",
    shapes: [
      fill(path("M150 132 C170 72 236 80 248 136 Z")),
      fill(path("M280 200 L372 122 L372 278 Z")),
      fill(ellipse(185, 205, 130, 86)),
      fill(path("M205 126 C240 160 240 250 205 286 L245 280 C278 245 278 165 245 132 Z")),
      fixed(circle(115, 185, 20), "#FFFFFF"),
      fixed(circle(110, 187, 9)),
      line("M78 228 Q98 246 118 232"),
    ],
  },
  {
    id: "baloes",
    name: "Balões",
    shapes: [
      line("M130 228 Q150 300 200 372 M270 218 Q250 300 200 372 M200 293 L200 372"),
      fill(ellipse(128, 150, 64, 80)),
      fill(ellipse(272, 140, 64, 80)),
      fill(ellipse(200, 214, 64, 80)),
    ],
  },
  {
    id: "carro",
    name: "Carro",
    shapes: [
      fill(
        path(
          "M44 245 L44 192 Q44 170 66 170 L108 170 L150 106 L270 106 L314 170 L338 170 Q360 170 360 192 L360 245 Q360 266 338 266 L66 266 Q44 266 44 245 Z",
        ),
      ),
      fill(path("M162 124 L198 124 L198 170 L130 170 Z")),
      fill(path("M214 124 L258 124 L290 170 L214 170 Z")),
      fill(circle(118, 270, 40)),
      fill(circle(288, 270, 40)),
      fixed(circle(118, 270, 13), "#FFFFFF"),
      fixed(circle(288, 270, 13), "#FFFFFF"),
    ],
  },
  {
    id: "gato",
    name: "Gato",
    shapes: [
      fill(path("M92 178 L104 52 L186 114 Z")),
      fill(path("M308 178 L296 52 L214 114 Z")),
      fill(circle(200, 228, 126)),
      fill(ellipse(152, 206, 24, 30)),
      fill(ellipse(248, 206, 24, 30)),
      fixed(circle(155, 212, 10)),
      fixed(circle(245, 212, 10)),
      fixed(path("M186 252 L214 252 L200 268 Z"), "#FF8FB1"),
      line("M200 268 Q186 294 164 284 M200 268 Q214 294 236 284"),
      line("M138 258 L66 244 M138 272 L64 280 M262 258 L334 244 M262 272 L336 280"),
    ],
  },
  {
    id: "flor",
    name: "Flor",
    shapes: [
      fill(rect(193, 180, 14, 160, 7)),
      fill(path("M200 300 C160 258 108 268 92 290 C118 322 170 322 200 300 Z")),
      fill(path("M200 262 C240 220 292 230 308 252 C282 284 230 284 200 262 Z")),
      fill(path("M136 326 L264 326 L248 392 L152 392 Z")),
      ...flowerPetals(200, 146, 66),
      fill(circle(200, 146, 44)),
    ],
  },
  {
    id: "casa",
    name: "Casa",
    shapes: [
      fill(circle(56, 56, 32)),
      fill(rect(252, 92, 38, 76)),
      fill(path("M56 208 L200 74 L344 208 Z")),
      fill(rect(88, 200, 224, 160)),
      fill(rect(170, 262, 60, 98, 10)),
      fill(rect(108, 226, 50, 48, 6)),
      fill(rect(242, 226, 50, 48, 6)),
      fixed(circle(217, 314, 6)),
      fill(path("M0 360 L400 360 L400 400 L0 400 Z")),
    ],
  },
  {
    id: "borboleta",
    name: "Borboleta",
    shapes: [
      line("M194 104 Q174 62 158 50 M206 104 Q226 62 242 50"),
      fixed(circle(158, 50, 8)),
      fixed(circle(242, 50, 8)),
      fill(path("M200 192 C150 70 40 58 44 150 C48 216 140 226 200 202 Z")),
      fill(path("M200 192 C250 70 360 58 356 150 C352 216 260 226 200 202 Z")),
      fill(path("M200 214 C150 214 78 246 94 312 C110 362 182 322 200 236 Z")),
      fill(path("M200 214 C250 214 322 246 306 312 C290 362 218 322 200 236 Z")),
      fill(circle(112, 148, 26)),
      fill(circle(288, 148, 26)),
      fill(ellipse(200, 222, 17, 88)),
      fill(circle(200, 122, 24)),
    ],
  },
  {
    id: "tartaruga",
    name: "Tartaruga",
    shapes: [
      fill(circle(328, 232, 40)),
      fill(ellipse(118, 278, 28, 36)),
      fill(ellipse(268, 278, 28, 36)),
      fill(path("M74 248 L40 262 L76 272 Z")),
      fill(path("M66 262 C66 112 314 112 314 262 Z")),
      fill(path("M190 152 L228 174 L228 218 L190 240 L152 218 L152 174 Z")),
      fixed(circle(342, 222, 7)),
      line("M338 252 Q352 262 364 250"),
    ],
  },
  {
    id: "arco-iris",
    name: "Arco-íris",
    shapes: [
      fill(path(rainbowBand(200, 300, 175, 147))),
      fill(path(rainbowBand(200, 300, 147, 119))),
      fill(path(rainbowBand(200, 300, 119, 91))),
      fill(path(rainbowBand(200, 300, 91, 63))),
      fill(ellipse(64, 304, 60, 36)),
      fill(ellipse(336, 304, 60, 36)),
    ],
  },
];

export const BG_KEY = "bg";

export function regionKey(index: number): string {
  return `r${index}`;
}

export function fillableKeys(drawing: Drawing): string[] {
  return drawing.shapes.flatMap((s, i) => (s.role === "fill" ? [regionKey(i)] : []));
}
