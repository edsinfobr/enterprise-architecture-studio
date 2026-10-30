// Core domain types for the Enterprise Architecture Studio.

export type Framework = "c4" | "archimate" | "togaf";

/** C4 Model abstraction levels. */
export type C4Level = "context" | "container" | "component" | "code";

/** ArchiMate core layers. */
export type ArchiMateLayer = "business" | "application" | "technology" | "motivation";

/**
 * A shape kind controls how a node is rendered on the canvas.
 * Each framework element definition maps to one of these.
 */
export type ShapeKind =
  | "person" // C4 person (head + body)
  | "box" // generic rounded rectangle (C4 system/container/component)
  | "boundary" // dashed container boundary
  | "archimate-element" // ArchiMate rectangle with a type icon in the corner
  | "note"; // free text / annotation

/** Direction arrows for a relationship. */
export type RelationshipEnd = "none" | "arrow" | "open" | "diamond" | "triangle";

/** Line style for relationships. */
export type LineStyle = "solid" | "dashed" | "dotted";

/**
 * Definition of a palette element belonging to a framework.
 * These are static (see src/data/*), instances become EaNode on the canvas.
 */
export interface ElementDef {
  /** Unique key, e.g. "c4.person" or "archimate.business.actor". */
  key: string;
  framework: Framework;
  /** Grouping used in the palette (level or layer). */
  group: string;
  label: string;
  description: string;
  shape: ShapeKind;
  /** Fill color (hex). */
  fill: string;
  /** Border color (hex). */
  stroke: string;
  /** Text color (hex). */
  text: string;
  /** Default width/height when dropped. */
  width: number;
  height: number;
  /**
   * Optional lucide icon name shown in the corner (ArchiMate) or
   * in the palette. Resolved in the UI layer.
   */
  icon?: string;
}

/** An element instance placed on the canvas. */
export interface EaNode {
  id: string;
  defKey: string;
  framework: Framework;
  shape: ShapeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  /** Secondary line, e.g. "[Container: Java]" in C4. */
  technology?: string;
  description?: string;
  fill: string;
  stroke: string;
  text: string;
  icon?: string;
  /** z-order; boundaries usually sit behind. */
  z: number;
}

/** A relationship between two nodes. */
export interface EaEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  technology?: string;
  lineStyle: LineStyle;
  startArrow: RelationshipEnd;
  endArrow: RelationshipEnd;
  color: string;
}

export interface DiagramMeta {
  project: string;
  author: string;
  role: string;
  date: string;
  showStamp: boolean;
}

export interface Diagram {
  id: string;
  name: string;
  framework: Framework;
  /** For C4, which level this diagram represents. */
  c4Level?: C4Level;
  nodes: EaNode[];
  edges: EaEdge[];
  meta: DiagramMeta;
  updatedAt: number;
}

/** Viewport transform for pan & zoom. */
export interface Viewport {
  x: number;
  y: number;
  scale: number;
}
