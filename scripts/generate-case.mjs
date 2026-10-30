// Gera os diagramas do Case "Enterprise Architecture - Banco" no formato
// nativo do Enterprise Architecture Studio (.eas.json), prontos para importar.
//
// Uso:  node scripts/generate-case.mjs
// Saída: ./case-arquiteto-banco/*.eas.json

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "case-arquiteto-banco");
mkdirSync(OUT, { recursive: true });

// ---- paletas (espelham src/data, somente os campos usados em runtime) ----
const C = {
  stakeholder: { k: "archimate.motivation.stakeholder", fill: "#ede9fe", stroke: "#7c3aed", text: "#4c1d95", icon: "Users", w: 180, h: 70 },
  driver: { k: "archimate.motivation.driver", fill: "#ede9fe", stroke: "#7c3aed", text: "#4c1d95", icon: "Compass", w: 180, h: 70 },
  goal: { k: "archimate.motivation.goal", fill: "#ede9fe", stroke: "#7c3aed", text: "#4c1d95", icon: "Target", w: 180, h: 70 },
  requirement: { k: "archimate.motivation.requirement", fill: "#ede9fe", stroke: "#7c3aed", text: "#4c1d95", icon: "ClipboardCheck", w: 180, h: 70 },
  actor: { k: "archimate.business.actor", fill: "#fef3c7", stroke: "#d97706", text: "#78350f", icon: "User", w: 180, h: 70 },
  role: { k: "archimate.business.role", fill: "#fef3c7", stroke: "#d97706", text: "#78350f", icon: "IdCard", w: 180, h: 70 },
  process: { k: "archimate.business.process", fill: "#fef3c7", stroke: "#d97706", text: "#78350f", icon: "ArrowRightLeft", w: 190, h: 72 },
  bservice: { k: "archimate.business.service", fill: "#fef3c7", stroke: "#d97706", text: "#78350f", icon: "Rows3", w: 190, h: 70 },
  bobject: { k: "archimate.business.object", fill: "#fef3c7", stroke: "#d97706", text: "#78350f", icon: "FileText", w: 170, h: 70 },
  appcomp: { k: "archimate.application.component", fill: "#cffafe", stroke: "#0891b2", text: "#164e63", icon: "Component", w: 190, h: 72 },
  appsvc: { k: "archimate.application.service", fill: "#cffafe", stroke: "#0891b2", text: "#164e63", icon: "Rows3", w: 190, h: 70 },
  appfn: { k: "archimate.application.function", fill: "#cffafe", stroke: "#0891b2", text: "#164e63", icon: "Cpu", w: 190, h: 70 },
  data: { k: "archimate.application.dataobject", fill: "#cffafe", stroke: "#0891b2", text: "#164e63", icon: "Database", w: 170, h: 70 },
  node: { k: "archimate.technology.node", fill: "#dcfce7", stroke: "#16a34a", text: "#14532d", icon: "Server", w: 180, h: 70 },
  techsvc: { k: "archimate.technology.service", fill: "#dcfce7", stroke: "#16a34a", text: "#14532d", icon: "Rows3", w: 190, h: 70 },
  system: { k: "archimate.technology.system", fill: "#dcfce7", stroke: "#16a34a", text: "#14532d", icon: "SquareTerminal", w: 190, h: 70 },
};

// C4 para o diagrama de contexto/microservices
const C4 = {
  person: { k: "c4.person", fill: "#1168bd", stroke: "#0b4884", text: "#ffffff", icon: "User", w: 160, h: 150, shape: "person" },
  system: { k: "c4.system", fill: "#1168bd", stroke: "#0b4884", text: "#ffffff", icon: "Box", w: 210, h: 120, shape: "box" },
  extsystem: { k: "c4.system.external", fill: "#999999", stroke: "#6b6b6b", text: "#ffffff", icon: "Boxes", w: 200, h: 110, shape: "box" },
  container: { k: "c4.container", fill: "#438dd5", stroke: "#2e6295", text: "#ffffff", icon: "Container", w: 200, h: 110, shape: "box" },
  db: { k: "c4.container.db", fill: "#438dd5", stroke: "#2e6295", text: "#ffffff", icon: "Database", w: 180, h: 100, shape: "box" },
  queue: { k: "c4.container.queue", fill: "#438dd5", stroke: "#2e6295", text: "#ffffff", icon: "Rows3", w: 200, h: 90, shape: "box" },
  boundary: { k: "c4.boundary", fill: "transparent", stroke: "#64748b", text: "#475569", icon: "SquareDashedBottom", w: 420, h: 300, shape: "boundary" },
};

let seq = 0;
const nid = (p = "n") => `case-${p}-${(seq++).toString(36)}`;

function N(def, label, x, y, opts = {}) {
  return {
    id: nid("node"),
    defKey: def.k,
    framework: "archimate",
    shape: def.shape ?? "archimate-element",
    x, y,
    width: opts.w ?? def.w,
    height: opts.h ?? def.h,
    label,
    technology: opts.technology,
    description: opts.description,
    fill: opts.fill ?? def.fill,
    stroke: opts.stroke ?? def.stroke,
    text: opts.text ?? def.text,
    icon: def.icon,
    z: def.shape === "boundary" ? 0 : 1,
  };
}

function C4N(def, label, x, y, opts = {}) {
  const n = N(def, label, x, y, opts);
  n.framework = "c4";
  n.shape = def.shape;
  return n;
}

function E(s, t, label, opts = {}) {
  return {
    id: nid("edge"),
    source: s.id ?? s,
    target: t.id ?? t,
    label,
    lineStyle: opts.lineStyle ?? "solid",
    startArrow: opts.startArrow ?? "none",
    endArrow: opts.endArrow ?? "arrow",
    color: opts.color ?? "#475569",
  };
}

function diagram(name, framework, nodes, edges, extra = {}) {
  return {
    id: nid("dgm"),
    name,
    framework,
    c4Level: extra.c4Level,
    nodes,
    edges,
    meta: {
      project: "Banco SP • Engajamento & Aceleração de Produtos",
      author: "Enterprise Architecture",
      role: "Enterprise Architect",
      date: new Date().toISOString().slice(0, 10),
      showStamp: true,
    },
    updatedAt: Date.now(),
  };
}

function write(diag) {
  const slug = diag.name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const file = join(OUT, `${slug}.eas.json`);
  writeFileSync(file, JSON.stringify(diag, null, 2), "utf8");
  console.log("✔", file);
}

// =====================================================================
// 1) VISÃO DE ARQUITETURA (TOGAF Fase A) — Motivação
// =====================================================================
function visaoArquitetura() {
  const nodes = [], edges = [];
  const clevel = N(C.stakeholder, "C-Level (CEO/CTO/CIO)", 60, 40);
  const stakeholders = N(C.stakeholder, "Clientes / Parceiros", 60, 160);
  const d1 = N(C.driver, "Baixo engajamento", 340, 20);
  const d2 = N(C.driver, "Lançamentos lentos (silos)", 340, 120);
  const d3 = N(C.driver, "Baixo reuso de capacidades", 340, 220);
  const g1 = N(C.goal, "Aumentar engajamento", 620, 20);
  const g2 = N(C.goal, "Acelerar time-to-market", 620, 120);
  const g3 = N(C.goal, "Reaproveitar capacidades", 620, 220);
  const r1 = N(C.requirement, "Habilitar Conta de Pagamentos", 900, 10, { description: "Produto recomendado" });
  const r2 = N(C.requirement, "Plataforma de capacidades reutilizáveis", 900, 110);
  const r3 = N(C.requirement, "Preservar estilo Microservices", 900, 210);
  const r4 = N(C.requirement, "Não adquirir Core pronto (compor)", 900, 300, { description: "Decisão: build/compose" });

  nodes.push(clevel, stakeholders, d1, d2, d3, g1, g2, g3, r1, r2, r3, r4);
  edges.push(
    E(clevel, d1, "possui"), E(clevel, d2, "possui"), E(clevel, d3, "possui"),
    E(d1, g1, "influencia"), E(d2, g2, "influencia"), E(d3, g3, "influencia"),
    E(g1, r1, "realizado por"), E(g2, r2, "realizado por"),
    E(g2, r3, "restringe", { lineStyle: "dashed" }),
    E(g3, r2, "realizado por"), E(g2, r4, "realizado por"),
  );
  write(diagram("01 - Visao de Arquitetura (TOGAF Fase A)", "togaf", nodes, edges));
}

// =====================================================================
// 2) MAPA DE PROBLEMAS DE NEGOCIO (Subdomínios DDD)
// =====================================================================
function subdominios() {
  const nodes = [], edges = [];
  // Core domains
  const coreTitle = N({ ...C.bservice, icon: "Star" }, "CORE DOMAINS (diferenciação)", 60, 20, { w: 260, fill: "#fde68a", stroke: "#b45309" });
  const core1 = N(C.process, "Conta de Pagamentos", 60, 110, { description: "Core — recomendado" });
  const core2 = N(C.process, "Originação de Crédito", 60, 200, { description: "Core — legado em silo" });
  const core3 = N(C.process, "Motor de Decisão/Risco", 60, 290, { description: "Core" });

  // Supporting domains
  const supTitle = N({ ...C.bservice, icon: "Puzzle" }, "SUPPORTING DOMAINS", 400, 20, { w: 260, fill: "#cffafe", stroke: "#0e7490" });
  const sup1 = N(C.process, "Cashback & Parcerias", 400, 110, { description: "Supporting — não priorizar agora" });
  const sup2 = N(C.process, "Gestão de Cartões", 400, 200, { description: "Supporting" });
  const sup3 = N(C.process, "Cobrança & Recuperação", 400, 290, { description: "Supporting" });

  // Generic domains
  const genTitle = N({ ...C.bservice, icon: "Boxes" }, "GENERIC DOMAINS (comoditizado)", 740, 20, { w: 280, fill: "#e2e8f0", stroke: "#475569", text: "#334155" });
  const gen1 = N(C.process, "KYC / Onboarding", 740, 110, { description: "Generic — usar SaaS/BaaS" });
  const gen2 = N(C.process, "Ledger / Contabilidade", 740, 200, { description: "Generic" });
  const gen3 = N(C.process, "Notificação / Comunicação", 740, 290, { description: "Generic" });
  const gen4 = N(C.process, "Prevenção a Fraude/AML", 740, 380, { description: "Generic — regulatório" });

  nodes.push(coreTitle, core1, core2, core3, supTitle, sup1, sup2, sup3, genTitle, gen1, gen2, gen3, gen4);
  write(diagram("02 - Mapa de Problemas de Negocio (Subdominios DDD)", "togaf", nodes, edges));
}

// =====================================================================
// 3) MAPA DE CAPACIDADES DE NEGOCIO (Top-level + classificação)
// =====================================================================
function capacidades() {
  const nodes = [], edges = [];
  const col = (title, color, stroke, x, items, startY = 110) => {
    const header = N({ ...C.bservice, icon: "Layers" }, title, x, 20, { w: 240, fill: color, stroke, text: "#1e293b" });
    nodes.push(header);
    items.forEach((it, i) => {
      nodes.push(N(C.bservice, it, x, startY + i * 86, { w: 240, fill: color, stroke, text: "#1e293b" }));
    });
  };
  // Capacidades de diferenciação (core)
  col("DIFERENCIAÇÃO", "#fde68a", "#b45309", 40, [
    "Gestão de Conta de Pagamentos",
    "Motor de Pagamentos (Pix/TED/Boleto)",
    "Originação & Decisão de Crédito",
  ]);
  // Capacidades de competitividade (supporting)
  col("COMPETITIVIDADE", "#a5f3fc", "#0e7490", 320, [
    "Programa de Cashback & Parcerias",
    "Gestão de Cartões",
    "Engajamento & Ofertas",
  ]);
  // Capacidades comoditizadas (generic/foundational)
  col("COMODITIZADAS / FUNDACIONAIS", "#e2e8f0", "#475569", 600, [
    "Identidade & KYC/Onboarding",
    "Ledger & Conciliação Contábil",
    "Prevenção a Fraude / AML",
    "Notificações & Comunicação",
  ]);

  write(diagram("03 - Mapa de Capacidades de Negocio", "togaf", nodes, edges));
}

// =====================================================================
// 4) CADEIA DE VALOR (Value Chain) com agrupamentos funcionais
// =====================================================================
function valueChain() {
  const nodes = [], edges = [];
  const stages = [
    "Aquisição & Onboarding",
    "Abertura de Conta",
    "Movimentação & Pagamentos",
    "Engajamento & Fidelização",
    "Suporte & Relacionamento",
  ];
  let prev = null;
  stages.forEach((s, i) => {
    const n = N(C.process, s, 40 + i * 230, 120, { w: 200, h: 90 });
    nodes.push(n);
    if (prev) edges.push(E(prev, n, "", { endArrow: "triangle" }));
    prev = n;
  });
  // Agrupamento funcional (atividades de apoio) abaixo
  const support = [
    "Risco & Compliance", "Ledger & Finanças", "Plataforma & Dados", "Atendimento",
  ];
  support.forEach((s, i) => {
    nodes.push(N(C.bservice, s, 40 + i * 290, 300, { w: 250, fill: "#e2e8f0", stroke: "#475569", text: "#334155" }));
  });
  const title = N({ ...C.goal, icon: "TrendingUp" }, "VALUE CHAIN — Jornada do Cliente de Pagamentos", 40, 20, { w: 560 });
  nodes.unshift(title);
  write(diagram("04 - Cadeia de Valor (Value Chain)", "togaf", nodes, edges));
}

// =====================================================================
// 5) VALUE STREAM — "Realizar um Pagamento" com interoperabilidade
// =====================================================================
function valueStream() {
  const nodes = [], edges = [];
  const steps = [
    ["Iniciar Pagamento", C.process],
    ["Autenticar & Autorizar", C.process],
    ["Validar Saldo/Limite", C.process],
    ["Executar Transação", C.process],
    ["Liquidar & Contabilizar", C.process],
    ["Notificar & Fidelizar", C.process],
  ];
  let prev = null;
  steps.forEach(([label], i) => {
    const n = N(C.process, label, 40 + i * 220, 60, { w: 190, h: 78 });
    nodes.push(n);
    if (prev) edges.push(E(prev, n, "", { endArrow: "triangle" }));
    prev = n;
  });
  // Funcionalidades/serviços de aplicação que suportam cada etapa (interoperabilidade)
  const svcs = [
    "Onboarding/KYC Svc",
    "Identity & AuthZ Svc",
    "Account & Balance Svc",
    "Payments Engine Svc",
    "Ledger Svc",
    "Rewards/Cashback Svc",
  ];
  svcs.forEach((s, i) => {
    const svc = N(C.appsvc, s, 40 + i * 220, 230, { w: 190 });
    nodes.push(svc);
    edges.push(E(nodes[i], svc, "usa", { lineStyle: "dashed", endArrow: "open" }));
  });
  const title = N({ ...C.goal, icon: "Workflow" }, "VALUE STREAM — Realizar um Pagamento", 40, 0, { w: 520 });
  // shift down existing by placing title separately (title at y=0, steps at y=60 already)
  nodes.unshift(title);
  write(diagram("05 - Value Stream - Realizar um Pagamento", "togaf", nodes, edges));
}

// =====================================================================
// 6) ARQUITETURA ALVO (TO-BE) — Microservices por domínio (C4 Container)
// =====================================================================
function targetArchitecture() {
  const nodes = [], edges = [];
  const customer = C4N(C4.person, "Cliente", 40, 60, { description: "App / Internet Banking" });
  const partner = C4N(C4.extsystem, "Parceiros (Cashback)", 40, 260);
  const bacen = C4N(C4.extsystem, "BACEN / SPI (Pix)", 40, 400);

  // API Gateway / BFF
  const gw = C4N(C4.container, "API Gateway / BFF", 320, 60, { technology: "[Kong/APIGW]" });

  // Microservices (bounded contexts)
  const ms = [
    ["Onboarding & KYC", 620, 20],
    ["Identity & AuthZ", 620, 150],
    ["Accounts (Conta Pagamentos)", 620, 280],
    ["Payments Engine", 900, 20],
    ["Ledger", 900, 150],
    ["Cashback & Rewards", 900, 280],
    ["Fraud & AML", 1180, 20],
    ["Notification", 1180, 150],
  ];
  const msNodes = ms.map(([l, x, y]) => C4N(C4.container, l, x, y, { technology: "[microservice]" }));

  // Event bus + DB per service (padrão database-per-service)
  const bus = C4N(C4.queue, "Event Bus (Kafka)", 900, 410, { technology: "[async/eventos]" });

  nodes.push(customer, partner, bacen, gw, ...msNodes, bus);
  edges.push(
    E(customer, gw, "HTTPS", { endArrow: "open" }),
    E(gw, msNodes[0], "", { endArrow: "open" }),
    E(gw, msNodes[1], "", { endArrow: "open" }),
    E(gw, msNodes[2], "", { endArrow: "open" }),
    E(gw, msNodes[3], "", { endArrow: "open" }),
    E(gw, msNodes[5], "", { endArrow: "open" }),
    E(msNodes[3], bacen, "Pix/SPI", { endArrow: "open" }),
    E(msNodes[5], partner, "parcerias", { endArrow: "open" }),
    E(msNodes[3], bus, "publica evento", { lineStyle: "dashed", endArrow: "open" }),
    E(bus, msNodes[4], "liquida", { lineStyle: "dashed", endArrow: "open" }),
    E(bus, msNodes[5], "pontua cashback", { lineStyle: "dashed", endArrow: "open" }),
    E(bus, msNodes[6], "analisa", { lineStyle: "dashed", endArrow: "open" }),
    E(bus, msNodes[7], "notifica", { lineStyle: "dashed", endArrow: "open" }),
  );
  write(diagram("06 - Arquitetura Alvo TO-BE (Microservices C4)", "c4", nodes, edges, { c4Level: "container" }));
}

// =====================================================================
// 7) ROADMAP DE MIGRAÇÃO — Arquiteturas intermediárias (Transition)
// =====================================================================
function roadmap() {
  const nodes = [], edges = [];
  const asis = N({ ...C.node, icon: "DatabaseZap" }, "AS-IS: Monólitos em Silo", 40, 60, { w: 230, h: 90, fill: "#fee2e2", stroke: "#dc2626", text: "#7f1d1d", description: "Empréstimos/Cartão sem reuso" });
  const t1 = N({ ...C.node, icon: "PlugZap" }, "Transição 1: Fundação", 320, 60, { w: 220, h: 90, description: "API GW, Identity, Event Bus, KYC (SaaS)" });
  const t2 = N({ ...C.node, icon: "Boxes" }, "Transição 2: Conta de Pagamentos", 600, 60, { w: 220, h: 90, description: "Accounts + Payments Engine + Ledger" });
  const t3 = N({ ...C.node, icon: "Repeat" }, "Transição 3: Reuso & Strangler", 880, 60, { w: 220, h: 90, description: "Extrair capacidades do legado" });
  const tobe = N({ ...C.node, icon: "CheckCircle2" }, "TO-BE: Plataforma de Capacidades", 1160, 60, { w: 230, h: 90, fill: "#dcfce7", stroke: "#16a34a", text: "#14532d" });
  nodes.push(asis, t1, t2, t3, tobe);
  edges.push(
    E(asis, t1, "Fase E/F", { endArrow: "triangle" }),
    E(t1, t2, "", { endArrow: "triangle" }),
    E(t2, t3, "", { endArrow: "triangle" }),
    E(t3, tobe, "", { endArrow: "triangle" }),
  );
  write(diagram("07 - Roadmap de Migracao (Arquiteturas Intermediarias)", "togaf", nodes, edges));
}

visaoArquitetura();
subdominios();
capacidades();
valueChain();
valueStream();
targetArchitecture();
roadmap();
console.log("\nTodos os diagramas do case foram gerados em ./case-arquiteto-banco/");
