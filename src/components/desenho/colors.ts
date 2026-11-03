export type PaletteColor = { id: string; hex: string; name: string };

/** Cores vivas e bem contrastantes — bebês distinguem melhor cores saturadas. */
export const COLORS: PaletteColor[] = [
  { id: "red", hex: "#FF3B30", name: "Vermelho" },
  { id: "orange", hex: "#FF9500", name: "Laranja" },
  { id: "yellow", hex: "#FFD60A", name: "Amarelo" },
  { id: "green", hex: "#34C759", name: "Verde" },
  { id: "sky", hex: "#5AC8FA", name: "Azul-claro" },
  { id: "blue", hex: "#0A60FF", name: "Azul" },
  { id: "purple", hex: "#AF52DE", name: "Roxo" },
  { id: "pink", hex: "#FF6FB5", name: "Rosa" },
  { id: "brown", hex: "#A0522D", name: "Marrom" },
  { id: "black", hex: "#2B2B2B", name: "Preto" },
  { id: "white", hex: "#FFFFFF", name: "Branco" },
];

/** "Mágico": cada toque usa a próxima cor — funciona mesmo sem escolher cor. */
export const RAINBOW = "rainbow";

/** Cores usadas pelo modo mágico (sem preto/branco/marrom, que são "sem graça"). */
export const MAGIC_CYCLE = COLORS.filter((c) => !["black", "white", "brown"].includes(c.id));

export function colorById(id: string): PaletteColor | undefined {
  return COLORS.find((c) => c.id === id);
}
