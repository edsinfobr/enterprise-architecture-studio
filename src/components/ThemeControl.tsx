import { useEffect, useRef, useState } from "react";
import type { ThemeMode } from "../hooks/useTheme";
import { Icon } from "./Icon";

interface Props {
  mode: ThemeMode;
  isDark: boolean;
  onCycle: () => void;
  onSelect: (mode: ThemeMode) => void;
}

const OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: "light", label: "Claro", icon: "Sun" },
  { mode: "dark", label: "Escuro", icon: "Moon" },
  { mode: "system", label: "Automático (sistema)", icon: "MonitorSmartphone" },
];

/** Icon shown for the current mode. In "system" mode we hint the resolved theme. */
function currentIcon(mode: ThemeMode): string {
  if (mode === "system") return "MonitorSmartphone";
  return mode === "dark" ? "Moon" : "Sun";
}

function label(mode: ThemeMode): string {
  return OPTIONS.find((o) => o.mode === mode)?.label ?? "Tema";
}

export function ThemeControl({ mode, isDark, onCycle, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700";

  return (
    <div className="relative flex items-center" ref={ref}>
      <button
        className={iconBtn}
        onClick={onCycle}
        title={`Tema: ${label(mode)} (clique para alternar)`}
        aria-label={`Tema atual: ${label(mode)}. Clique para alternar.`}
      >
        <Icon name={currentIcon(mode)} size={18} />
      </button>
      <button
        className="flex h-9 w-5 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
        onClick={() => setOpen((o) => !o)}
        title="Escolher modo de tema"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Icon name="ChevronDown" size={14} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {OPTIONS.map((o) => {
            const active = o.mode === mode;
            return (
              <button
                key={o.mode}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  onSelect(o.mode);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <Icon name={o.icon} size={16} />
                <span className="flex-1">{o.label}</span>
                {o.mode === "system" && (
                  <span className="text-[10px] text-slate-400">
                    {isDark ? "escuro" : "claro"}
                  </span>
                )}
                {active && <Icon name="Check" size={15} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
