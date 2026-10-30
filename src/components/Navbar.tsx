import type { DiagramController } from "../hooks/useDiagram";
import { Icon } from "./Icon";

interface Props {
  ctrl: DiagramController;
  onSave: () => void;
  onOpenLibrary: () => void;
  onImport: () => void;
  onExportJson: () => void;
  onExport: (fmt: "png" | "svg" | "pdf") => void;
  dark: boolean;
  onToggleDark: () => void;
}

export function Navbar({
  ctrl,
  onSave,
  onOpenLibrary,
  onImport,
  onExportJson,
  onExport,
  dark,
  onToggleDark,
}: Props) {
  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700";
  const textBtn =
    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700";

  return (
    <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2 pr-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
          <Icon name="Network" size={18} />
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">
            Enterprise Architecture Studio
          </div>
          <div className="text-[11px] text-slate-400">
            C4 · ArchiMate · TOGAF
          </div>
        </div>
      </div>

      <input
        className="mx-2 min-w-0 flex-1 rounded-md border border-transparent bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-200 focus:border-blue-400 focus:outline-none dark:bg-slate-700/50 dark:text-slate-100"
        value={ctrl.diagram.name}
        onChange={(e) => ctrl.setName(e.target.value)}
        aria-label="Nome do diagrama"
      />

      <div className="flex items-center gap-0.5">
        <button
          className={iconBtn}
          onClick={ctrl.undo}
          disabled={!ctrl.canUndo()}
          title="Desfazer (Ctrl+Z)"
        >
          <Icon name="Undo2" size={18} />
        </button>
        <button
          className={iconBtn}
          onClick={ctrl.redo}
          disabled={!ctrl.canRedo()}
          title="Refazer (Ctrl+Y)"
        >
          <Icon name="Redo2" size={18} />
        </button>
      </div>

      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

      <button className={textBtn} onClick={onSave} title="Salvar no navegador">
        <Icon name="Save" size={16} /> <span className="hidden md:inline">Salvar</span>
      </button>
      <button className={textBtn} onClick={onOpenLibrary} title="Diagramas salvos">
        <Icon name="FolderOpen" size={16} />
        <span className="hidden md:inline">Biblioteca</span>
      </button>
      <button className={textBtn} onClick={onImport} title="Importar JSON">
        <Icon name="Upload" size={16} />
      </button>
      <button className={textBtn} onClick={onExportJson} title="Exportar JSON">
        <Icon name="Download" size={16} />
      </button>

      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

      <div className="flex items-center gap-0.5">
        <button className={textBtn} onClick={() => onExport("png")}>
          <Icon name="Image" size={16} /> <span className="hidden lg:inline">PNG</span>
        </button>
        <button className={textBtn} onClick={() => onExport("svg")}>
          <span className="text-xs font-bold">SVG</span>
        </button>
        <button className={textBtn} onClick={() => onExport("pdf")}>
          <Icon name="FileText" size={16} /> <span className="hidden lg:inline">PDF</span>
        </button>
      </div>

      <button className={iconBtn} onClick={onToggleDark} title="Alternar tema">
        <Icon name={dark ? "Sun" : "Moon"} size={18} />
      </button>
    </header>
  );
}
