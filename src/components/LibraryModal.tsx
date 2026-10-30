import type { Diagram } from "../types";
import { Icon } from "./Icon";

interface Props {
  diagrams: Diagram[];
  onOpen: (d: Diagram) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const FW_LABEL: Record<Diagram["framework"], string> = {
  c4: "C4 Model",
  archimate: "ArchiMate",
  togaf: "TOGAF",
};

export function LibraryModal({ diagrams, onOpen, onDelete, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Biblioteca de Diagramas
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {diagrams.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Nenhum diagrama salvo ainda. Use <strong>Salvar</strong> na barra
              superior.
            </p>
          ) : (
            <ul className="space-y-2">
              {diagrams
                .slice()
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                      <Icon name="Network" size={18} />
                    </div>
                    <button
                      onClick={() => onOpen(d)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {d.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {FW_LABEL[d.framework]} · {d.nodes.length} elementos ·{" "}
                        {new Date(d.updatedAt).toLocaleString()}
                      </div>
                    </button>
                    <button
                      onClick={() => onDelete(d.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                      title="Excluir"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
