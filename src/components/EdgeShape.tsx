import type { EaEdge, EaNode, RelationshipEnd } from "../types";

interface Props {
  edge: EaEdge;
  source: EaNode;
  target: EaNode;
  selected: boolean;
  onSelect: (id: string, e: React.PointerEvent) => void;
}

interface Pt {
  x: number;
  y: number;
}

function center(n: EaNode): Pt {
  return { x: n.x + n.width / 2, y: n.y + n.height / 2 };
}

/** Intersection of the line (from node center toward `toward`) with node border. */
function borderPoint(n: EaNode, toward: Pt): Pt {
  const c = center(n);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (dx === 0 && dy === 0) return c;
  const hw = n.width / 2;
  const hh = n.height / 2;
  const scale = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh);
  return { x: c.x + dx * scale, y: c.y + dy * scale };
}

export function EdgeShape({ edge, source, target, selected, onSelect }: Props) {
  const s = borderPoint(source, center(target));
  const t = borderPoint(target, center(source));
  const mid = { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 };

  const dash =
    edge.lineStyle === "dashed"
      ? "7 5"
      : edge.lineStyle === "dotted"
        ? "2 4"
        : undefined;

  const markerEnd = markerId(edge.endArrow, edge.id, "end");
  const markerStart = markerId(edge.startArrow, edge.id, "start");

  return (
    <g>
      <defs>
        {arrowMarker(edge.endArrow, `${edge.id}-end`, edge.color, false)}
        {arrowMarker(edge.startArrow, `${edge.id}-start`, edge.color, true)}
      </defs>
      {/* invisible fat line for easier clicking */}
      <line
        x1={s.x}
        y1={s.y}
        x2={t.x}
        y2={t.y}
        stroke="transparent"
        strokeWidth={14}
        style={{ cursor: "pointer" }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect(edge.id, e);
        }}
      />
      <line
        x1={s.x}
        y1={s.y}
        x2={t.x}
        y2={t.y}
        stroke={selected ? "#2563eb" : edge.color}
        strokeWidth={selected ? 2.5 : 1.5}
        strokeDasharray={dash}
        markerEnd={markerEnd}
        markerStart={markerStart}
        pointerEvents="none"
      />
      {edge.label && (
        <g pointerEvents="none">
          <rect
            x={mid.x - labelWidth(edge.label) / 2}
            y={mid.y - 11}
            width={labelWidth(edge.label)}
            height={20}
            rx={4}
            fill="#ffffff"
            stroke="#e2e8f0"
          />
          <text
            x={mid.x}
            y={mid.y + 3}
            textAnchor="middle"
            fontSize={11}
            fill="#334155"
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
}

function labelWidth(s: string) {
  return Math.max(28, s.length * 6.5 + 14);
}

function markerId(end: RelationshipEnd, id: string, side: string) {
  return end === "none" ? undefined : `url(#arrow-${id}-${side})`;
}

function arrowMarker(
  end: RelationshipEnd,
  id: string,
  color: string,
  reversed: boolean
) {
  if (end === "none") return null;
  const orient = reversed ? "auto-start-reverse" : "auto";
  const common = {
    id: `arrow-${id}`,
    markerWidth: 12,
    markerHeight: 12,
    refX: 9,
    refY: 5,
    orient,
    markerUnits: "userSpaceOnUse" as const,
  };
  if (end === "arrow") {
    return (
      <marker {...common}>
        <path d="M0,0 L10,5 L0,10 z" fill={color} />
      </marker>
    );
  }
  if (end === "open") {
    return (
      <marker {...common}>
        <path d="M0,0 L10,5 L0,10" fill="none" stroke={color} strokeWidth={1.5} />
      </marker>
    );
  }
  if (end === "triangle") {
    return (
      <marker {...common}>
        <path d="M0,0 L10,5 L0,10 z" fill="#fff" stroke={color} strokeWidth={1.2} />
      </marker>
    );
  }
  // diamond
  return (
    <marker {...common} refX={10}>
      <path d="M0,5 L5,0 L10,5 L5,10 z" fill={color} />
    </marker>
  );
}
