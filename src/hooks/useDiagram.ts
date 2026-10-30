import { useCallback, useRef, useState } from "react";
import type { Diagram, EaNode, EaEdge, ElementDef, Framework } from "../types";
import { uid } from "../utils/id";

function emptyDiagram(framework: Framework = "c4"): Diagram {
  return {
    id: uid("dgm"),
    name: "Novo Diagrama",
    framework,
    c4Level: framework === "c4" ? "context" : undefined,
    nodes: [],
    edges: [],
    meta: {
      project: "",
      author: "",
      role: "",
      date: new Date().toISOString().slice(0, 10),
      showStamp: false,
    },
    updatedAt: Date.now(),
  };
}

export function nodeFromDef(def: ElementDef, x: number, y: number): EaNode {
  return {
    id: uid("node"),
    defKey: def.key,
    framework: def.framework,
    shape: def.shape,
    x,
    y,
    width: def.width,
    height: def.height,
    label: def.label,
    fill: def.fill,
    stroke: def.stroke,
    text: def.text,
    icon: def.icon,
    z: def.shape === "boundary" ? 0 : 1,
  };
}

const MAX_HISTORY = 50;

export function useDiagram(initial?: Diagram) {
  const [diagram, setDiagramState] = useState<Diagram>(
    () => initial ?? emptyDiagram()
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const past = useRef<Diagram[]>([]);
  const future = useRef<Diagram[]>([]);

  const commit = useCallback(
    (updater: (d: Diagram) => Diagram, recordHistory = true) => {
      setDiagramState((prev) => {
        if (recordHistory) {
          past.current.push(prev);
          if (past.current.length > MAX_HISTORY) past.current.shift();
          future.current = [];
        }
        const next = updater(prev);
        return { ...next, updatedAt: Date.now() };
      });
    },
    []
  );

  const undo = useCallback(() => {
    setDiagramState((prev) => {
      const prior = past.current.pop();
      if (!prior) return prev;
      future.current.push(prev);
      return prior;
    });
  }, []);

  const redo = useCallback(() => {
    setDiagramState((prev) => {
      const next = future.current.pop();
      if (!next) return prev;
      past.current.push(prev);
      return next;
    });
  }, []);

  const addNode = useCallback(
    (def: ElementDef, x: number, y: number) => {
      const n = nodeFromDef(def, x, y);
      commit((d) => ({ ...d, nodes: [...d.nodes, n] }));
      setSelectedIds([n.id]);
      return n.id;
    },
    [commit]
  );

  const updateNode = useCallback(
    (id: string, patch: Partial<EaNode>, recordHistory = true) => {
      commit(
        (d) => ({
          ...d,
          nodes: d.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        }),
        recordHistory
      );
    },
    [commit]
  );

  const moveNode = useCallback(
    (id: string, x: number, y: number, recordHistory = false) => {
      updateNode(id, { x, y }, recordHistory);
    },
    [updateNode]
  );

  const deleteSelection = useCallback(() => {
    if (selectedIds.length === 0) return;
    const sel = new Set(selectedIds);
    commit((d) => ({
      ...d,
      nodes: d.nodes.filter((n) => !sel.has(n.id)),
      edges: d.edges.filter(
        (e) => !sel.has(e.id) && !sel.has(e.source) && !sel.has(e.target)
      ),
    }));
    setSelectedIds([]);
  }, [commit, selectedIds]);

  const addEdge = useCallback(
    (source: string, target: string) => {
      if (source === target) return;
      const e: EaEdge = {
        id: uid("edge"),
        source,
        target,
        lineStyle: "solid",
        startArrow: "none",
        endArrow: "arrow",
        color: "#475569",
      };
      commit((d) => {
        const exists = d.edges.some(
          (x) => x.source === source && x.target === target
        );
        if (exists) return d;
        return { ...d, edges: [...d.edges, e] };
      });
      setSelectedIds([e.id]);
    },
    [commit]
  );

  const updateEdge = useCallback(
    (id: string, patch: Partial<EaEdge>) => {
      commit((d) => ({
        ...d,
        edges: d.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      }));
    },
    [commit]
  );

  const updateMeta = useCallback(
    (patch: Partial<Diagram["meta"]>) => {
      commit((d) => ({ ...d, meta: { ...d.meta, ...patch } }));
    },
    [commit]
  );

  const setName = useCallback(
    (name: string) => commit((d) => ({ ...d, name }), false),
    [commit]
  );

  const setC4Level = useCallback(
    (level: Diagram["c4Level"]) =>
      commit((d) => ({ ...d, c4Level: level }), false),
    [commit]
  );

  const loadDiagram = useCallback((d: Diagram) => {
    past.current = [];
    future.current = [];
    setDiagramState(d);
    setSelectedIds([]);
  }, []);

  const newDiagram = useCallback((framework: Framework) => {
    past.current = [];
    future.current = [];
    setDiagramState(emptyDiagram(framework));
    setSelectedIds([]);
  }, []);

  return {
    diagram,
    selectedIds,
    setSelectedIds,
    addNode,
    updateNode,
    moveNode,
    deleteSelection,
    addEdge,
    updateEdge,
    updateMeta,
    setName,
    setC4Level,
    loadDiagram,
    newDiagram,
    undo,
    redo,
    canUndo: () => past.current.length > 0,
    canRedo: () => future.current.length > 0,
  };
}

export type DiagramController = ReturnType<typeof useDiagram>;
