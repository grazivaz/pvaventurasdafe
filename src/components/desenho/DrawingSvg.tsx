import { forwardRef } from "react";
import { BG_KEY, regionKey, type Drawing, type Shape } from "./drawings";

type Props = {
  drawing: Drawing;
  colors: Record<string, string>;
  className?: string;
  /** Quando true, áreas pintáveis recebem data-region para o toque. */
  interactive?: boolean;
};

const STROKE = "#2B2B2B";

function ShapeEl({ shape, fillColor, region }: { shape: Shape; fillColor: string; region?: string }) {
  const common = {
    fill: fillColor,
    stroke: STROKE,
    strokeWidth: shape.role === "line" ? 7 : 7,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    "data-region": region,
    style: {
      pointerEvents: region ? ("all" as const) : ("none" as const),
      transition: "fill 180ms ease-out",
    },
  };
  switch (shape.kind) {
    case "path":
      return <path d={shape.d} {...common} />;
    case "circle":
      return <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...common} />;
    case "ellipse":
      return (
        <ellipse
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          transform={shape.rotate ? `rotate(${shape.rotate} ${shape.cx} ${shape.cy})` : undefined}
          {...common}
        />
      );
    case "rect":
      return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} {...common} />;
  }
}

const DrawingSvg = forwardRef<SVGSVGElement, Props>(function DrawingSvg(
  { drawing, colors, className, interactive = false },
  ref,
) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={drawing.name}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect
        x="0"
        y="0"
        width="400"
        height="400"
        rx="24"
        fill={colors[BG_KEY] ?? "#FFFFFF"}
        data-region={interactive ? BG_KEY : undefined}
        style={{ transition: "fill 180ms ease-out", pointerEvents: interactive ? "all" : "none" }}
      />
      {drawing.shapes.map((s, i) => {
        const key = regionKey(i);
        if (s.role === "line") return <ShapeEl key={key} shape={s} fillColor="none" />;
        if (s.role === "fixed") return <ShapeEl key={key} shape={s} fillColor={s.color ?? STROKE} />;
        return (
          <ShapeEl
            key={key}
            shape={s}
            fillColor={colors[key] ?? "#FFFFFF"}
            region={interactive ? key : undefined}
          />
        );
      })}
    </svg>
  );
});

export default DrawingSvg;
