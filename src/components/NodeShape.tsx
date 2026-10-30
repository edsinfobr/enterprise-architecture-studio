import type { EaNode } from "../types";
import { Icon } from "./Icon";

interface Props {
  node: EaNode;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onStartConnection: (e: React.PointerEvent, id: string) => void;
  onDoubleClick: (id: string) => void;
}

/**
 * Renders a single node as an SVG group. Handles three visual families:
 *  - person: C4 actor (circle head + rounded body)
 *  - boundary: dashed container with label at top-left
 *  - box / archimate-element / note: rectangle with icon + text
 */
export function NodeShape({
  node,
  selected,
  onPointerDown,
  onStartConnection,
  onDoubleClick,
}: Props) {
  const { x, y, width: w, height: h } = node;

  const selectionRing = selected ? (
    <rect
      x={-4}
      y={-4}
      width={w + 8}
      height={h + 8}
      rx={10}
      fill="none"
      stroke="#2563eb"
      strokeWidth={2}
      strokeDasharray="6 4"
      pointerEvents="none"
    />
  ) : null;

  const connectionHandle = selected ? (
    <circle
      cx={w}
      cy={h / 2}
      r={7}
      fill="#2563eb"
      stroke="#fff"
      strokeWidth={2}
      style={{ cursor: "crosshair" }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onStartConnection(e, node.id);
      }}
    />
  ) : null;

  const common = {
    onPointerDown: (e: React.PointerEvent) => onPointerDown(e, node.id),
    onDoubleClick: () => onDoubleClick(node.id),
    style: { cursor: "move" as const },
  };

  return (
    <g transform={`translate(${x},${y})`} className="ea-no-select">
      {node.shape === "person" && renderPerson(node, common)}
      {node.shape === "boundary" && renderBoundary(node, common)}
      {(node.shape === "box" ||
        node.shape === "archimate-element" ||
        node.shape === "note") &&
        renderBox(node, common)}
      {selectionRing}
      {connectionHandle}
    </g>
  );
}

type Handlers = {
  onPointerDown: (e: React.PointerEvent) => void;
  onDoubleClick: () => void;
  style: React.CSSProperties;
};

function textBlock(node: EaNode, topOffset: number) {
  return (
    <foreignObject
      x={10}
      y={topOffset}
      width={node.width - 20}
      height={node.height - topOffset - 8}
      pointerEvents="none"
    >
      <div
        style={{
          color: node.text,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 13 }}>{node.label}</div>
        {node.technology && (
          <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>
            {node.technology}
          </div>
        )}
        {node.description && (
          <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
            {node.description}
          </div>
        )}
      </div>
    </foreignObject>
  );
}

function renderBox(node: EaNode, h: Handlers) {
  const isArchi = node.shape === "archimate-element";
  return (
    <g {...h}>
      <rect
        width={node.width}
        height={node.height}
        rx={isArchi ? 4 : 8}
        fill={node.fill}
        stroke={node.stroke}
        strokeWidth={1.5}
      />
      {node.icon && (
        <g transform={`translate(${node.width - 26}, 8)`} pointerEvents="none">
          <Icon name={node.icon} size={16} color={node.text} opacity={0.9} />
        </g>
      )}
      {textBlock(node, isArchi ? 8 : 16)}
    </g>
  );
}

function renderPerson(node: EaNode, h: Handlers) {
  const cx = node.width / 2;
  const headR = 22;
  return (
    <g {...h}>
      <circle
        cx={cx}
        cy={headR + 6}
        r={headR}
        fill={node.fill}
        stroke={node.stroke}
        strokeWidth={1.5}
      />
      <rect
        x={node.width * 0.12}
        y={headR * 2 + 6}
        width={node.width * 0.76}
        height={node.height - headR * 2 - 10}
        rx={18}
        fill={node.fill}
        stroke={node.stroke}
        strokeWidth={1.5}
      />
      <foreignObject
        x={8}
        y={headR * 2 + 12}
        width={node.width - 16}
        height={node.height - headR * 2 - 18}
        pointerEvents="none"
      >
        <div
          style={{
            color: node.text,
            textAlign: "center",
            fontWeight: 600,
            fontSize: 12,
            lineHeight: 1.2,
          }}
        >
          {node.label}
          {node.description && (
            <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 400 }}>
              {node.description}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
}

function renderBoundary(node: EaNode, h: Handlers) {
  return (
    <g {...h}>
      <rect
        width={node.width}
        height={node.height}
        rx={10}
        fill="rgba(100,116,139,0.04)"
        stroke={node.stroke}
        strokeWidth={1.5}
        strokeDasharray="8 6"
      />
      <foreignObject x={12} y={8} width={node.width - 24} height={24} pointerEvents="none">
        <div
          style={{
            color: node.text,
            fontWeight: 700,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {node.label}
        </div>
      </foreignObject>
    </g>
  );
}
