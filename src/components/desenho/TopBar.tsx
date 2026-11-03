import HoldButton from "./HoldButton";

type Props = {
  onHome: () => void;
  onParent: () => void;
  children?: React.ReactNode;
};

/** Barra de cima: casinha (segurar = voltar), ferramentas no meio, cadeado (segurar = pais). */
export default function TopBar({ onHome, onParent, children }: Props) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <HoldButton onHold={onHome} label="Voltar ao início" className="h-12 w-12 shrink-0 sm:h-14 sm:w-14">
        🏠
      </HoldButton>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-3">{children}</div>
      <HoldButton onHold={onParent} duration={2000} label="Área dos pais" className="h-12 w-12 shrink-0 sm:h-14 sm:w-14">
        🔒
      </HoldButton>
    </div>
  );
}

export function BarButton({
  onPress,
  label,
  children,
  active = false,
  disabled = false,
  pulse = false,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  pulse?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onPointerDown={(e) => {
        e.preventDefault();
        if (!disabled) onPress();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onPress();
      }}
      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl leading-none shadow-md transition-transform active:scale-90 disabled:opacity-35 sm:h-16 sm:w-16 sm:text-3xl ${
        active ? "bg-orange-300 ring-4 ring-orange-500" : "bg-white/90"
      } ${pulse ? "rq-pulse" : ""}`}
    >
      {children}
    </button>
  );
}
