import type { Diagram, EaNode, EaEdge } from "../types";
import { ARCHIMATE_ELEMENTS } from "./archimate";

// TOGAF is a method (the ADM), not a notation. Here we provide:
//  1) A reference guide to the ADM phases (shown in the TOGAF panel).
//  2) A set of starter templates for common TOGAF artifacts, modeled
//     with ArchiMate elements (the recommended modeling language).

export interface AdmPhase {
  id: string;
  name: string;
  purpose: string;
}

export const TOGAF_ADM_PHASES: AdmPhase[] = [
  { id: "prelim", name: "Preliminar", purpose: "Preparar a organização e definir princípios e frameworks de arquitetura." },
  { id: "A", name: "A • Visão da Arquitetura", purpose: "Escopo, stakeholders, visão e aprovação inicial." },
  { id: "B", name: "B • Arquitetura de Negócio", purpose: "Estratégia, organização, processos e serviços de negócio." },
  { id: "C", name: "C • Arquitetura de SI", purpose: "Arquiteturas de Dados e de Aplicações." },
  { id: "D", name: "D • Arquitetura de Tecnologia", purpose: "Infraestrutura, plataformas e serviços tecnológicos." },
  { id: "E", name: "E • Oportunidades e Soluções", purpose: "Identificar pacotes de trabalho e abordagem de implementação." },
  { id: "F", name: "F • Planejamento de Migração", purpose: "Roadmap priorizado e plano de transição." },
  { id: "G", name: "G • Governança de Implementação", purpose: "Supervisão da implementação em conformidade com a arquitetura." },
  { id: "H", name: "H • Gestão de Mudança", purpose: "Gerenciar mudanças no ciclo de vida da arquitetura." },
  { id: "req", name: "Gestão de Requisitos", purpose: "Processo central contínuo de gestão de requisitos." },
];

const defByKey = (key: string) =>
  ARCHIMATE_ELEMENTS.find((d) => d.key === key)!;

let seq = 0;
const nid = () => `tpl-${Date.now().toString(36)}-${seq++}`;

function node(
  defKey: string,
  label: string,
  x: number,
  y: number,
  technology?: string
): EaNode {
  const d = defByKey(defKey);
  return {
    id: nid(),
    defKey: d.key,
    framework: d.framework,
    shape: d.shape,
    x,
    y,
    width: d.width,
    height: d.height,
    label,
    technology,
    fill: d.fill,
    stroke: d.stroke,
    text: d.text,
    icon: d.icon,
    z: 1,
  };
}

function edge(source: string, target: string, label?: string): EaEdge {
  return {
    id: nid(),
    source,
    target,
    label,
    lineStyle: "solid",
    startArrow: "none",
    endArrow: "arrow",
    color: "#475569",
  };
}

function meta(project: string) {
  return {
    project,
    author: "",
    role: "Enterprise Architect",
    date: new Date().toISOString().slice(0, 10),
    showStamp: true,
  };
}

/** Phase B: Business Footprint / Service model starter. */
function businessArchitecture(): Diagram {
  const stakeholder = node("archimate.motivation.stakeholder", "Cliente", 80, 60);
  const actor = node("archimate.business.actor", "Atendente", 80, 200);
  const role = node("archimate.business.role", "Gerente de Conta", 340, 200);
  const process = node("archimate.business.process", "Processo de Onboarding", 340, 60);
  const service = node("archimate.business.service", "Serviço de Abertura de Conta", 600, 60);
  const object = node("archimate.business.object", "Contrato", 600, 200);

  return {
    id: nid(),
    name: "TOGAF • Arquitetura de Negócio (Fase B)",
    framework: "togaf",
    nodes: [stakeholder, actor, role, process, service, object],
    edges: [
      edge(actor.id, role.id, "assigned"),
      edge(role.id, process.id, "realiza"),
      edge(process.id, service.id, "realiza"),
      edge(process.id, object.id, "acessa"),
      edge(stakeholder.id, service.id, "usa"),
    ],
    meta: meta("Arquitetura de Negócio"),
    updatedAt: Date.now(),
  };
}

/** Phase C: Application/Data architecture starter. */
function applicationArchitecture(): Diagram {
  const svc = node("archimate.application.service", "Serviço de Pagamentos", 80, 60);
  const comp = node("archimate.application.component", "App de Pagamentos", 80, 200);
  const fn = node("archimate.application.function", "Processar Transação", 340, 200);
  const data = node("archimate.application.dataobject", "Transação", 600, 200);

  return {
    id: nid(),
    name: "TOGAF • Arquitetura de Aplicações (Fase C)",
    framework: "togaf",
    nodes: [svc, comp, fn, data],
    edges: [
      edge(comp.id, svc.id, "realiza"),
      edge(comp.id, fn.id, "atribuído"),
      edge(fn.id, data.id, "acessa"),
    ],
    meta: meta("Arquitetura de Aplicações"),
    updatedAt: Date.now(),
  };
}

/** Phase D: Technology architecture starter. */
function technologyArchitecture(): Diagram {
  const svc = node("archimate.technology.service", "Serviço de Hospedagem", 80, 60);
  const node1 = node("archimate.technology.node", "Servidor de Aplicação", 80, 200, "Linux / Kubernetes");
  const sys = node("archimate.technology.system", "Sistema de Banco de Dados", 340, 200, "PostgreSQL");
  const device = node("archimate.technology.device", "Appliance de Storage", 600, 200);

  return {
    id: nid(),
    name: "TOGAF • Arquitetura de Tecnologia (Fase D)",
    framework: "togaf",
    nodes: [svc, node1, sys, device],
    edges: [
      edge(node1.id, svc.id, "realiza"),
      edge(node1.id, sys.id, "hospeda"),
      edge(sys.id, device.id, "usa"),
    ],
    meta: meta("Arquitetura de Tecnologia"),
    updatedAt: Date.now(),
  };
}

/** Phase A: Architecture Vision / Motivation starter. */
function architectureVision(): Diagram {
  const stakeholder = node("archimate.motivation.stakeholder", "CEO / Board", 80, 60);
  const driver = node("archimate.motivation.driver", "Pressão Competitiva", 80, 200);
  const goal = node("archimate.motivation.goal", "Reduzir Time-to-Market", 340, 200);
  const req = node("archimate.motivation.requirement", "Plataforma Cloud-Native", 600, 200);

  return {
    id: nid(),
    name: "TOGAF • Visão da Arquitetura (Fase A)",
    framework: "togaf",
    nodes: [stakeholder, driver, goal, req],
    edges: [
      edge(stakeholder.id, driver.id, "possui"),
      edge(driver.id, goal.id, "influencia"),
      edge(goal.id, req.id, "realizado por"),
    ],
    meta: meta("Visão da Arquitetura"),
    updatedAt: Date.now(),
  };
}

export interface TogafTemplate {
  id: string;
  phase: string;
  title: string;
  description: string;
  build: () => Diagram;
}

export const TOGAF_TEMPLATES: TogafTemplate[] = [
  {
    id: "vision",
    phase: "Fase A",
    title: "Visão da Arquitetura",
    description: "Stakeholders, drivers, goals e requisitos iniciais.",
    build: architectureVision,
  },
  {
    id: "business",
    phase: "Fase B",
    title: "Arquitetura de Negócio",
    description: "Atores, papéis, processos e serviços de negócio.",
    build: businessArchitecture,
  },
  {
    id: "application",
    phase: "Fase C",
    title: "Arquitetura de Aplicações",
    description: "Componentes, serviços, funções e objetos de dados.",
    build: applicationArchitecture,
  },
  {
    id: "technology",
    phase: "Fase D",
    title: "Arquitetura de Tecnologia",
    description: "Nós, serviços de tecnologia, sistemas e dispositivos.",
    build: technologyArchitecture,
  },
];
