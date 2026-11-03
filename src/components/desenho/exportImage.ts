/** Evento usado quando o ambiente não permite baixar arquivos (ex.: prévia em Artifact). */
export const SAVE_PREVIEW_EVENT = "rq-save-preview";

/** Compartilha (celular) ou baixa (computador) a imagem. */
export async function shareOrDownload(blob: Blob, filename: string) {
  if ((globalThis as { __RQ_PREVIEW_SAVE__?: boolean }).__RQ_PREVIEW_SAVE__) {
    window.dispatchEvent(new CustomEvent(SAVE_PREVIEW_EVENT, { detail: URL.createObjectURL(blob) }));
    return;
  }
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: "Desenho do meu pequeno artista" });
      return;
    } catch {
      /* cancelado — cai para download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

/** Rasteriza o SVG do desenho colorido em PNG 1200x1200. */
export async function svgToPngBlob(svg: SVGSVGElement, size = 1200): Promise<Blob | null> {
  const xml = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("svg"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    return await canvasToBlob(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}
