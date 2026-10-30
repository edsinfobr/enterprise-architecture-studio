import { useCallback, useEffect, useRef, useState } from "react";
import { useDiagram } from "./hooks/useDiagram";
import type { Diagram } from "./types";
import { Navbar } from "./components/Navbar";
import { Palette } from "./components/Palette";
import { Canvas } from "./components/Canvas";
import { Inspector } from "./components/Inspector";
import { LibraryModal } from "./components/LibraryModal";
import { loadDiagrams, saveDiagrams, downloadJson } from "./utils/storage";
import { exportPng, exportSvg, exportPdf } from "./utils/export";

export default function App() {
  const ctrl = useDiagram();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [library, setLibrary] = useState<Diagram[]>(() => loadDiagrams());
  const [showLibrary, setShowLibrary] = useState(false);
  const [dark, setDark] = useState(
    () =>
      window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  // ---- Persistence ----
  const persist = useCallback(
    (next: Diagram[]) => {
      setLibrary(next);
      saveDiagrams(next);
    },
    []
  );

  const handleSave = useCallback(() => {
    const d = ctrl.diagram;
    const exists = library.some((x) => x.id === d.id);
    const next = exists
      ? library.map((x) => (x.id === d.id ? d : x))
      : [...library, d];
    persist(next);
    flash(exists ? "Diagrama atualizado" : "Diagrama salvo");
  }, [ctrl.diagram, library, persist, flash]);

  const handleDelete = useCallback(
    (id: string) => persist(library.filter((x) => x.id !== id)),
    [library, persist]
  );

  const handleOpen = useCallback(
    (d: Diagram) => {
      ctrl.loadDiagram(d);
      setShowLibrary(false);
    },
    [ctrl]
  );

  // ---- Import JSON ----
  const handleImportClick = () => fileRef.current?.click();
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(String(reader.result)) as Diagram;
        if (d && Array.isArray(d.nodes)) {
          ctrl.loadDiagram(d);
          flash("Diagrama importado");
        } else flash("Arquivo inválido");
      } catch {
        flash("Falha ao ler o arquivo");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ---- Export images ----
  const handleExport = useCallback(
    async (fmt: "png" | "svg" | "pdf") => {
      const el = canvasRef.current;
      if (!el) return;
      const opts = {
        fileName: ctrl.diagram.name,
        background: dark ? "#0f172a" : "#ffffff",
      };
      try {
        if (fmt === "png") await exportPng(el, opts);
        else if (fmt === "svg") await exportSvg(el, opts);
        else await exportPdf(el, opts);
      } catch {
        flash("Falha ao exportar");
      }
    },
    [ctrl.diagram.name, dark, flash]
  );

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (typing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? ctrl.redo() : ctrl.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        ctrl.redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        ctrl.deleteSelection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ctrl, handleSave]);

  const meta = ctrl.diagram.meta;

  return (
    <div className="flex h-full flex-col bg-slate-100 dark:bg-slate-900">
      <Navbar
        ctrl={ctrl}
        onSave={handleSave}
        onOpenLibrary={() => setShowLibrary(true)}
        onImport={handleImportClick}
        onExportJson={() => downloadJson(ctrl.diagram)}
        onExport={handleExport}
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
      />

      <div className="flex min-h-0 flex-1">
        <Palette ctrl={ctrl} />
        <main className="relative min-w-0 flex-1">
          <Canvas ref={canvasRef} ctrl={ctrl} onEditNode={() => {}} />
          {meta.showStamp && (
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-md border border-slate-300 bg-white/90 px-3 py-2 text-[11px] leading-tight text-slate-600 shadow-sm dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-300">
              <div className="font-bold">{meta.project || "Projeto"}</div>
              <div>{meta.author || "Autor"} · {meta.role || "Papel"}</div>
              <div className="text-slate-400">{meta.date}</div>
            </div>
          )}
        </main>
        <Inspector ctrl={ctrl} />
      </div>

      {showLibrary && (
        <LibraryModal
          diagrams={library}
          onOpen={handleOpen}
          onDelete={handleDelete}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
          {toast}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  );
}
