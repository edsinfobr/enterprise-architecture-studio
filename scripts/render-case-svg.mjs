// Renderiza cada diagrama .eas.json como um arquivo SVG estático (./images/*.svg).
// SVG gerado como string pura (sem DOM) para rodar em Node e ser exibido
// diretamente nos READMEs do GitHub.
//
// Uso: node scripts/render-svg.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIAGRAMS = join(__dirname, "..", "case-arquiteto-banco");
const OUT = join(__dirname, "..", "case-arquiteto-banco", "images");
mkdirSync(OUT, { recursive: true });

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function wrapText(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

function labelSvg(node) {
  const cx = node.width / 2;
  const lines = wrapText(node.label, Math.max(10, Math.floor(node.width / 8)));
  const extra = [];
  if (node.technology) extra.push({ t: node.technology, size: 10, op: 0.85 });
  if (node.description) extra.push({ t: node.description, size: 10, op: 0.8 });
  const total = lines.length + extra.length;
  const lh = 15;
  let y = node.height / 2 - ((total - 1) * lh) / 2 + 4;
  if (node.shape === "boundary") y = 18;
  let out = "";
  const anchor = node.shape === "boundary" ? "start" : "middle";
  const tx = node.shape === "boundary" ? 12 : cx;
  for (const ln of lines) {
    out += `<text x="${tx}" y="${y}" text-anchor="${anchor}" font-size="13" font-weight="600" fill="${node.text}">${esc(ln)}</text>`;
    y += lh;
  }
  for (const e of extra) {
    out += `<text x="${cx}" y="${y}" text-anchor="middle" font-size="${e.size}" fill="${node.text}" opacity="${e.op}">${esc(e.t)}</text>`;
    y += 13;
  }
  return out;
}

function nodeSvg(node) {
  let inner = "";
  if (node.shape === "person") {
    const cx = node.width / 2;
    inner += `<circle cx="${cx}" cy="28" r="22" fill="${node.fill}" stroke="${node.stroke}" stroke-width="1.5"/>`;
    inner += `<rect x="${node.width * 0.12}" y="50" width="${node.width * 0.76}" height="${node.height - 60}" rx="18" fill="${node.fill}" stroke="${node.stroke}" stroke-width="1.5"/>`;
    inner += `<text x="${cx}" y="${node.height - 24}" text-anchor="middle" font-size="12" font-weight="600" fill="${node.text}">${esc(node.label)}</text>`;
  } else if (node.shape === "boundary") {
    inner += `<rect width="${node.width}" height="${node.height}" rx="10" fill="rgba(100,116,139,0.04)" stroke="${node.stroke}" stroke-width="1.5" stroke-dasharray="8 6"/>`;
    inner += labelSvg(node);
  } else {
    const rx = node.shape === "archimate-element" ? 4 : 8;
    const fill = node.fill === "transparent" ? "#ffffff" : node.fill;
    inner += `<rect width="${node.width}" height="${node.height}" rx="${rx}" fill="${fill}" stroke="${node.stroke}" stroke-width="1.5"/>`;
    inner += labelSvg(node);
  }
  return `<g transform="translate(${node.x},${node.y})">${inner}</g>`;
}

function center(n) {
  return { x: n.x + n.width / 2, y: n.y + n.height / 2 };
}
function borderPoint(n, toward) {
  const c = center(n);
  const dx = toward.x - c.x, dy = toward.y - c.y;
  if (dx === 0 && dy === 0) return c;
  const hw = n.width / 2, hh = n.height / 2;
  const scale = 1 / Math.max(Math.abs(dx) / hw, Math.abs(dy) / hh);
  return { x: c.x + dx * scale, y: c.y + dy * scale };
}

function edgeSvg(edge, byId) {
  const s = byId.get(edge.source), t = byId.get(edge.target);
  if (!s || !t) return { defs: "", body: "" };
  const p1 = borderPoint(s, center(t)), p2 = borderPoint(t, center(s));
  const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  const dash = edge.lineStyle === "dashed" ? "7 5" : edge.lineStyle === "dotted" ? "2 4" : null;

  let defs = "";
  let markerAttr = "";
  if (edge.endArrow && edge.endArrow !== "none") {
    const id = `m-${edge.id}`;
    let path;
    if (edge.endArrow === "triangle") path = `<path d="M0,0 L10,5 L0,10 z" fill="#fff" stroke="${edge.color}" stroke-width="1.2"/>`;
    else if (edge.endArrow === "open") path = `<path d="M0,0 L10,5 L0,10" fill="none" stroke="${edge.color}" stroke-width="1.5"/>`;
    else path = `<path d="M0,0 L10,5 L0,10 z" fill="${edge.color}"/>`;
    defs = `<marker id="${id}" markerWidth="12" markerHeight="12" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">${path}</marker>`;
    markerAttr = ` marker-end="url(#${id})"`;
  }
  const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
  let body = `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${edge.color}" stroke-width="1.5"${dashAttr}${markerAttr}/>`;
  if (edge.label) {
    const w = Math.max(28, edge.label.length * 6.5 + 14);
    body += `<rect x="${mid.x - w / 2}" y="${mid.y - 11}" width="${w}" height="20" rx="4" fill="#fff" stroke="#e2e8f0"/>`;
    body += `<text x="${mid.x}" y="${mid.y + 3}" text-anchor="middle" font-size="11" fill="#334155">${esc(edge.label)}</text>`;
  }
  return { defs, body };
}

function renderDiagram(diagram) {
  const pad = 40;
  const maxX = Math.max(400, ...diagram.nodes.map((n) => n.x + n.width)) + pad;
  const maxY = Math.max(300, ...diagram.nodes.map((n) => n.y + n.height)) + pad;

  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
  let defs = "";
  let edges = "";
  for (const e of diagram.edges) {
    const r = edgeSvg(e, byId);
    defs += r.defs;
    edges += r.body;
  }
  const sorted = [...diagram.nodes].sort((a, b) => (a.z ?? 1) - (b.z ?? 1));
  const nodes = sorted.map(nodeSvg).join("");

  const title = esc(diagram.name);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${maxX}" height="${maxY + 34}" viewBox="0 0 ${maxX} ${maxY + 34}" font-family="Segoe UI, system-ui, Arial, sans-serif">
  <rect width="${maxX}" height="${maxY + 34}" fill="#ffffff"/>
  <text x="16" y="24" font-size="15" font-weight="700" fill="#0f172a">${title}</text>
  <g transform="translate(0,34)">
    <defs>${defs}</defs>
    ${edges}
    ${nodes}
  </g>
</svg>`;
}

const files = readdirSync(DIAGRAMS).filter((f) => f.endsWith(".eas.json")).sort();
for (const f of files) {
  const diagram = JSON.parse(readFileSync(join(DIAGRAMS, f), "utf8"));
  const svg = renderDiagram(diagram);
  const out = join(OUT, f.replace(/\.eas\.json$/, ".svg"));
  writeFileSync(out, svg, "utf8");
  console.log("✔", out);
}
console.log(`\n${files.length} imagens SVG geradas em ./images/`);
