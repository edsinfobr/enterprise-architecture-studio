import { forwardRef, useCallback, useRef, useState } from "react";
import type { DiagramController } from "../hooks/useDiagram";
import type { EaNode, Viewport } from "../types";
import { getElementDef } from "../data";
import { NodeShape } from "./NodeShape";
import { EdgeShape } from "./EdgeShape";

interface Props {
  ctrl: DiagramController;
  onEditNode: (id: string) => void;
}

interface DragState {
  nodeId: string;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

interface ConnectState {
  sourceId: string;
  x: number;
  y: number;
}

/** The exported canvas surface. The inner <g id="ea-scene"> is what gets exported. */
export const Canvas = forwardRef<HTMLDivElement, Props>(function Canvas(
  { ctrl, onEditNode },
  exportRef
) {
  const { diagram, selectedIds, setSelectedIds } = ctrl;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const drag = useRef<DragState | null>(null);
  const [connect, setConnect] = useState<ConnectState | null>(null);
  const panning = useRef<{ x: number; y: number } | null>(null);

  const toWorld = useCallback(
    (clientX: number, clientY: number) => {
      const rect = wrapRef.current!.getBoundingClientRect();
      return {
        x: (clientX - rect.left - vp.x) / vp.scale,
        y: (clientY - rect.top - vp.y) / vp.scale,
      };
    },
    [vp]
  );

  // ---- Zoom with wheel (ctrl/standard) ----
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = wrapRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = -e.deltaY * 0.0015;
    const nextScale = Math.min(2.5, Math.max(0.2, vp.scale * (1 + delta)));
    // keep point under cursor stable
    const wx = (mx - vp.x) / vp.scale;
    const wy = (my - vp.y) / vp.scale;
    setVp({
      scale: nextScale,
      x: mx - wx * nextScale,
      y: my - wy * nextScale,
    });
  };

  // ---- Node dragging ----
  const onNodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const node = diagram.nodes.find((n) => n.id === id)!;
    const multi = e.shiftKey;
    setSelectedIds((prev) =>
      multi
        ? prev.includes(id)
          ? prev
          : [...prev, id]
        : prev.includes(id)
          ? prev
          : [id]
    );
    const w = toWorld(e.clientX, e.clientY);
    drag.current = {
      nodeId: id,
      startX: w.x,
      startY: w.y,
      originX: node.x,
      originY: node.y,
    };
  };

  const onStartConnection = (e: React.PointerEvent, id: string) => {
    const w = toWorld(e.clientX, e.clientY);
    setConnect({ sourceId: id, x: w.x, y: w.y });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (drag.current) {
      const w = toWorld(e.clientX, e.clientY);
      const dx = w.x - drag.current.startX;
      const dy = w.y - drag.current.startY;
      let nx = drag.current.originX + dx;
      let ny = drag.current.originY + dy;
      // snap to 8px grid
      nx = Math.round(nx / 8) * 8;
      ny = Math.round(ny / 8) * 8;
      ctrl.moveNode(drag.current.nodeId, nx, ny, false);
      return;
    }
    if (connect) {
      const w = toWorld(e.clientX, e.clientY);
      setConnect({ ...connect, x: w.x, y: w.y });
      return;
    }
    if (panning.current) {
      setVp((prev) => ({
        ...prev,
        x: prev.x + (e.clientX - panning.current!.x),
        y: prev.y + (e.clientY - panning.current!.y),
      }));
      panning.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (drag.current) {
      // record final position in history
      const node = diagram.nodes.find((n) => n.id === drag.current!.nodeId);
      if (node) ctrl.updateNode(node.id, { x: node.x, y: node.y }, true);
      drag.current = null;
    }
    if (connect) {
      const target = nodeAt(diagram.nodes, toWorld(e.clientX, e.clientY));
      if (target && target.id !== connect.sourceId) {
        ctrl.addEdge(connect.sourceId, target.id);
      }
      setConnect(null);
    }
    panning.current = null;
  };

  const onBackgroundPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || e.button === 2 || e.altKey) {
      panning.current = { x: e.clientX, y: e.clientY };
      return;
    }
    panning.current = { x: e.clientX, y: e.clientY };
    setSelectedIds([]);
  };

  // ---- Drop from palette ----
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const key = e.dataTransfer.getData("application/x-ea-element");
    if (!key) return;
    const def = getElementDef(key);
    if (!def) return;
    const w = toWorld(e.clientX, e.clientY);
    ctrl.addNode(def, Math.round((w.x - def.width / 2) / 8) * 8, Math.round((w.y - def.height / 2) / 8) * 8);
  };

  const sorted = [...diagram.nodes].sort((a, b) => a.z - b.z);
  const nodeById = new Map(diagram.nodes.map((n) => [n.id, n]));
  const connSource = connect ? nodeById.get(connect.sourceId) : undefined;

  return (
    <div
      ref={setRefs(wrapRef, exportRef)}
      className="ea-canvas relative h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-900"
      onWheel={onWheel}
      onPointerDown={onBackgroundPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onContextMenu={(e) => e.preventDefault()}
      style={{ cursor: panning.current ? "grabbing" : "default" }}
    >
      <svg className="h-full w-full">
        {/* grid */}
        <defs>
          <pattern
            id="ea-grid"
            width={24 * vp.scale}
            height={24 * vp.scale}
            patternUnits="userSpaceOnUse"
            x={vp.x}
            y={vp.y}
          >
            <circle cx={1} cy={1} r={1} fill="rgba(100,116,139,0.25)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ea-grid)" />

        <g transform={`translate(${vp.x},${vp.y}) scale(${vp.scale})`}>
          {/* edges below nodes */}
          {diagram.edges.map((edge) => {
            const s = nodeById.get(edge.source);
            const t = nodeById.get(edge.target);
            if (!s || !t) return null;
            return (
              <EdgeShape
                key={edge.id}
                edge={edge}
                source={s}
                target={t}
                selected={selectedIds.includes(edge.id)}
                onSelect={(id) => setSelectedIds([id])}
              />
            );
          })}

          {/* live connection preview */}
          {connect && connSource && (
            <line
              x1={connSource.x + connSource.width}
              y1={connSource.y + connSource.height / 2}
              x2={connect.x}
              y2={connect.y}
              stroke="#2563eb"
              strokeWidth={2}
              strokeDasharray="5 4"
              pointerEvents="none"
            />
          )}

          {sorted.map((node) => (
            <NodeShape
              key={node.id}
              node={node}
              selected={selectedIds.includes(node.id)}
              onPointerDown={onNodePointerDown}
              onStartConnection={onStartConnection}
              onDoubleClick={onEditNode}
            />
          ))}
        </g>
      </svg>

      <ZoomControls vp={vp} setVp={setVp} />
    </div>
  );
});

function ZoomControls({
  vp,
  setVp,
}: {
  vp: Viewport;
  setVp: React.Dispatch<React.SetStateAction<Viewport>>;
}) {
  const btn =
    "h-8 w-8 rounded-md bg-white text-slate-700 shadow border border-slate-200 hover:bg-slate-100 text-sm font-semibold dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-1">
      <button
        className={btn}
        onClick={() =>
          setVp((v) => ({ ...v, scale: Math.max(0.2, v.scale - 0.1) }))
        }
        title="Diminuir zoom"
      >
        −
      </button>
      <span className="rounded-md bg-white px-2 py-1 text-xs text-slate-600 shadow border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
        {Math.round(vp.scale * 100)}%
      </span>
      <button
        className={btn}
        onClick={() =>
          setVp((v) => ({ ...v, scale: Math.min(2.5, v.scale + 0.1) }))
        }
        title="Aumentar zoom"
      >
        +
      </button>
      <button
        className={btn}
        onClick={() => setVp({ x: 0, y: 0, scale: 1 })}
        title="Resetar visualização"
      >
        ⟳
      </button>
    </div>
  );
}

function nodeAt(nodes: EaNode[], p: { x: number; y: number }): EaNode | null {
  // topmost (highest z, later in array) first
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    if (p.x >= n.x && p.x <= n.x + n.width && p.y >= n.y && p.y <= n.y + n.height)
      return n;
  }
  return null;
}

/** Merge an internal ref with a forwarded ref. */
function setRefs(
  internal: React.MutableRefObject<HTMLDivElement | null>,
  forwarded: React.ForwardedRef<HTMLDivElement>
) {
  return (el: HTMLDivElement | null) => {
    internal.current = el;
    if (typeof forwarded === "function") forwarded(el);
    else if (forwarded) forwarded.current = el;
  };
}
