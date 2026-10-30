import type { DiagramController } from "../hooks/useDiagram";
import type { EaEdge, LineStyle, RelationshipEnd } from "../types";

interface Props {
  ctrl: DiagramController;
}

const field =
  "w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200";
const lbl = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

export function Inspector({ ctrl }: Props) {
  const { diagram, selectedIds } = ctrl;
  const id = selectedIds[0];
  const node = diagram.nodes.find((n) => n.id === id);
  const edge = diagram.edges.find((e) => e.id === id);

  return (
    <aside className="flex h-full w-72 flex-col border-l border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          Propriedades
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {!node && !edge && <DiagramProps ctrl={ctrl} />}
        {node && <NodeProps ctrl={ctrl} id={node.id} />}
        {edge && <EdgeProps ctrl={ctrl} edge={edge} />}
      </div>
    </aside>
  );
}

function DiagramProps({ ctrl }: { ctrl: DiagramController }) {
  const { diagram } = ctrl;
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Nenhum elemento selecionado. Edite as informações do diagrama e o carimbo
        de identificação abaixo.
      </p>
      <div>
        <label className={lbl}>Nome do diagrama</label>
        <input
          className={field}
          value={diagram.name}
          onChange={(e) => ctrl.setName(e.target.value)}
        />
      </div>
      <hr className="border-slate-200 dark:border-slate-700" />
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
        Carimbo (Metadata)
      </h3>
      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={diagram.meta.showStamp}
          onChange={(e) => ctrl.updateMeta({ showStamp: e.target.checked })}
        />
        Exibir carimbo no canvas
      </label>
      <div>
        <label className={lbl}>Projeto</label>
        <input
          className={field}
          value={diagram.meta.project}
          onChange={(e) => ctrl.updateMeta({ project: e.target.value })}
        />
      </div>
      <div>
        <label className={lbl}>Autor</label>
        <input
          className={field}
          value={diagram.meta.author}
          onChange={(e) => ctrl.updateMeta({ author: e.target.value })}
        />
      </div>
      <div>
        <label className={lbl}>Papel / Cargo</label>
        <input
          className={field}
          value={diagram.meta.role}
          onChange={(e) => ctrl.updateMeta({ role: e.target.value })}
        />
      </div>
      <div>
        <label className={lbl}>Data</label>
        <input
          type="date"
          className={field}
          value={diagram.meta.date}
          onChange={(e) => ctrl.updateMeta({ date: e.target.value })}
        />
      </div>
    </div>
  );
}

function NodeProps({ ctrl, id }: { ctrl: DiagramController; id: string }) {
  const node = ctrl.diagram.nodes.find((n) => n.id === id)!;
  return (
    <div className="space-y-4">
      <div>
        <label className={lbl}>Rótulo</label>
        <input
          className={field}
          value={node.label}
          onChange={(e) => ctrl.updateNode(id, { label: e.target.value }, false)}
        />
      </div>
      <div>
        <label className={lbl}>Tecnologia / Estereótipo</label>
        <input
          className={field}
          placeholder="ex: [Container: Node.js]"
          value={node.technology ?? ""}
          onChange={(e) =>
            ctrl.updateNode(id, { technology: e.target.value }, false)
          }
        />
      </div>
      <div>
        <label className={lbl}>Descrição</label>
        <textarea
          className={`${field} resize-none`}
          rows={3}
          value={node.description ?? ""}
          onChange={(e) =>
            ctrl.updateNode(id, { description: e.target.value }, false)
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={lbl}>Preenchimento</label>
          <input
            type="color"
            className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-600"
            value={node.fill === "transparent" ? "#ffffff" : node.fill}
            onChange={(e) => ctrl.updateNode(id, { fill: e.target.value })}
          />
        </div>
        <div>
          <label className={lbl}>Borda</label>
          <input
            type="color"
            className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-600"
            value={node.stroke}
            onChange={(e) => ctrl.updateNode(id, { stroke: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={lbl}>Largura</label>
          <input
            type="number"
            className={field}
            value={Math.round(node.width)}
            onChange={(e) =>
              ctrl.updateNode(id, { width: Math.max(60, +e.target.value) })
            }
          />
        </div>
        <div>
          <label className={lbl}>Altura</label>
          <input
            type="number"
            className={field}
            value={Math.round(node.height)}
            onChange={(e) =>
              ctrl.updateNode(id, { height: Math.max(40, +e.target.value) })
            }
          />
        </div>
      </div>
      <button
        onClick={ctrl.deleteSelection}
        className="w-full rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
      >
        Excluir elemento
      </button>
    </div>
  );
}

const ARROWS: { v: RelationshipEnd; l: string }[] = [
  { v: "none", l: "Nenhum" },
  { v: "arrow", l: "Seta cheia" },
  { v: "open", l: "Seta aberta" },
  { v: "triangle", l: "Triângulo" },
  { v: "diamond", l: "Losango" },
];

const LINES: { v: LineStyle; l: string }[] = [
  { v: "solid", l: "Sólida" },
  { v: "dashed", l: "Tracejada" },
  { v: "dotted", l: "Pontilhada" },
];

function EdgeProps({ ctrl, edge }: { ctrl: DiagramController; edge: EaEdge }) {
  return (
    <div className="space-y-4">
      <div>
        <label className={lbl}>Rótulo da relação</label>
        <input
          className={field}
          value={edge.label ?? ""}
          placeholder="ex: usa, realiza, HTTPS"
          onChange={(e) => ctrl.updateEdge(edge.id, { label: e.target.value })}
        />
      </div>
      <div>
        <label className={lbl}>Estilo da linha</label>
        <select
          className={field}
          value={edge.lineStyle}
          onChange={(e) =>
            ctrl.updateEdge(edge.id, { lineStyle: e.target.value as LineStyle })
          }
        >
          {LINES.map((o) => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={lbl}>Ponta inicial</label>
          <select
            className={field}
            value={edge.startArrow}
            onChange={(e) =>
              ctrl.updateEdge(edge.id, {
                startArrow: e.target.value as RelationshipEnd,
              })
            }
          >
            {ARROWS.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Ponta final</label>
          <select
            className={field}
            value={edge.endArrow}
            onChange={(e) =>
              ctrl.updateEdge(edge.id, {
                endArrow: e.target.value as RelationshipEnd,
              })
            }
          >
            {ARROWS.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={lbl}>Cor</label>
        <input
          type="color"
          className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-600"
          value={edge.color}
          onChange={(e) => ctrl.updateEdge(edge.id, { color: e.target.value })}
        />
      </div>
      <button
        onClick={ctrl.deleteSelection}
        className="w-full rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
      >
        Excluir relação
      </button>
    </div>
  );
}
