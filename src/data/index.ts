import type { ElementDef, Framework } from "../types";
import { C4_ELEMENTS } from "./c4";
import { ARCHIMATE_ELEMENTS } from "./archimate";

export const ALL_ELEMENTS: ElementDef[] = [
  ...C4_ELEMENTS,
  ...ARCHIMATE_ELEMENTS,
];

const BY_KEY = new Map(ALL_ELEMENTS.map((d) => [d.key, d]));

export function getElementDef(key: string): ElementDef | undefined {
  return BY_KEY.get(key);
}

export function elementsForFramework(fw: Framework): ElementDef[] {
  if (fw === "togaf") return ARCHIMATE_ELEMENTS; // TOGAF models with ArchiMate
  return ALL_ELEMENTS.filter((d) => d.framework === fw);
}

/** Group palette elements by their `group` field, preserving insertion order. */
export function groupedElements(fw: Framework): Record<string, ElementDef[]> {
  const out: Record<string, ElementDef[]> = {};
  for (const d of elementsForFramework(fw)) {
    (out[d.group] ??= []).push(d);
  }
  return out;
}
