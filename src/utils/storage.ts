import type { Diagram } from "../types";

const KEY = "ea-studio.diagrams.v1";

export function loadDiagrams(): Diagram[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Diagram[]) : [];
  } catch {
    return [];
  }
}

export function saveDiagrams(diagrams: Diagram[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(diagrams));
  } catch {
    // storage full or unavailable — fail silently; export still works.
  }
}

export function downloadJson(diagram: Diagram): void {
  const blob = new Blob([JSON.stringify(diagram, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug(diagram.name)}.eas.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "diagram"
  );
}
