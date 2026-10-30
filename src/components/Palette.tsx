import { useState } from "react";
import type { DiagramController } from "../hooks/useDiagram";
import type { ElementDef, Framework } from "../types";
import { groupedElements } from "../data";
import { C4_LEVELS } from "../data/c4";
import { TOGAF_ADM_PHASES, TOGAF_TEMPLATES } from "../data/togaf";
import { Icon } from "./Icon";

interface Props {
  ctrl: DiagramController;
}

const FRAMEWORKS: { key: Framework; label: string }[] = [
  { key: "c4", label: "C4 Model" },
  { key: "archimate", label: "ArchiMate" },
  { key: "togaf", label: "TOGAF" },
];

export function Palette({ ctrl }: Props) {
  const fw = ctrl.diagram.framework;
  const groups = groupedElements(fw);

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 p-3 dark:border-slate-700">
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Framework
        </label>
        <div className="flex gap-1">
          {FRAMEWORKS.map((f) => (
            <button
              key={f.key}
              onClick={() => ctrl.newDiagram(f.key)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition ${
                fw === f.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {fw === "c4" && <C4LevelSwitcher ctrl={ctrl} />}
      {fw === "togaf" && <TogafPanel ctrl={ctrl} />}

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {fw === "togaf" && (
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            TOGAF usa a notação ArchiMate. Arraste os elementos abaixo ou carregue
            um template de artefato acima.
          </p>
        )}
        {Object.entries(groups).map(([group, defs]) => (
          <div key={group} className="mb-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              {group}
            </h3>
            <div className="grid grid-cols-1 gap-1.5">
              {defs.map((d) => (
                <PaletteItem key={d.key} def={d} ctrl={ctrl} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function PaletteItem({ def, ctrl }: { def: ElementDef; ctrl: DiagramController }) {
  return (
    <button
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-ea-element", def.key);
        e.dataTransfer.effectAllowed = "copy";
      }}
      onClick={() => ctrl.addNode(def, 120, 120)}
      className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-left text-xs transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-700/40 dark:hover:border-blue-500 dark:hover:bg-slate-700"
      title={def.description}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
        style={{ backgroundColor: def.fill === "transparent" ? "#e2e8f0" : def.fill }}
      >
        <Icon
          name={def.icon}
          size={14}
          color={def.text === "#ffffff" ? "#ffffff" : def.stroke}
        />
      </span>
      <span className="font-medium text-slate-700 dark:text-slate-200">
        {def.label}
      </span>
    </button>
  );
}

function C4LevelSwitcher({ ctrl }: { ctrl: DiagramController }) {
  return (
    <div className="border-b border-slate-200 p-3 dark:border-slate-700">
      <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
        Nível C4
      </label>
      <select
        value={ctrl.diagram.c4Level ?? "context"}
        onChange={(e) => ctrl.setC4Level(e.target.value as never)}
        className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
      >
        {C4_LEVELS.map((l) => (
          <option key={l.key} value={l.key}>
            {l.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[11px] text-slate-400">
        {C4_LEVELS.find((l) => l.key === (ctrl.diagram.c4Level ?? "context"))
          ?.description}
      </p>
    </div>
  );
}

function TogafPanel({ ctrl }: { ctrl: DiagramController }) {
  const [showAdm, setShowAdm] = useState(false);
  return (
    <div className="border-b border-slate-200 p-3 dark:border-slate-700">
      <button
        onClick={() => setShowAdm((s) => !s)}
        className="mb-2 flex w-full items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300"
      >
        <span>Ciclo ADM (TOGAF)</span>
        <Icon name={showAdm ? "ChevronUp" : "ChevronDown"} size={14} />
      </button>
      {showAdm && (
        <ul className="mb-3 space-y-1">
          {TOGAF_ADM_PHASES.map((p) => (
            <li
              key={p.id}
              className="rounded bg-slate-50 px-2 py-1 text-[11px] leading-tight text-slate-600 dark:bg-slate-700/40 dark:text-slate-300"
              title={p.purpose}
            >
              <span className="font-semibold">{p.name}</span>
            </li>
          ))}
        </ul>
      )}

      <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
        Templates de Artefatos
      </label>
      <div className="space-y-1.5">
        {TOGAF_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => ctrl.loadDiagram(t.build())}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-700/40 dark:hover:border-blue-500"
            title={t.description}
          >
            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
              {t.phase}
            </div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {t.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
