import type { ElementDef, ArchiMateLayer } from "../types";

// ArchiMate 3.x core elements (a practical subset).
// Standard layer colors: Business = yellow, Application = cyan/blue,
// Technology = green, Motivation = purple.

export const ARCHIMATE_LAYERS: {
  key: ArchiMateLayer;
  label: string;
  color: string;
}[] = [
  { key: "business", label: "Camada de Negócio", color: "#fde68a" },
  { key: "application", label: "Camada de Aplicação", color: "#a5f3fc" },
  { key: "technology", label: "Camada de Tecnologia", color: "#bbf7d0" },
  { key: "motivation", label: "Motivação", color: "#ddd6fe" },
];

const BUSINESS = { fill: "#fef3c7", stroke: "#d97706", text: "#78350f" };
const APPLICATION = { fill: "#cffafe", stroke: "#0891b2", text: "#164e63" };
const TECHNOLOGY = { fill: "#dcfce7", stroke: "#16a34a", text: "#14532d" };
const MOTIVATION = { fill: "#ede9fe", stroke: "#7c3aed", text: "#4c1d95" };

const BASE = {
  framework: "archimate" as const,
  shape: "archimate-element" as const,
  width: 170,
  height: 70,
};

export const ARCHIMATE_ELEMENTS: ElementDef[] = [
  // --- Business layer ---
  {
    ...BASE,
    key: "archimate.business.actor",
    group: "Negócio",
    label: "Business Actor",
    description: "Entidade organizacional capaz de comportamento.",
    icon: "User",
    ...BUSINESS,
  },
  {
    ...BASE,
    key: "archimate.business.role",
    group: "Negócio",
    label: "Business Role",
    description: "Responsabilidade atribuída a um ator.",
    icon: "IdCard",
    ...BUSINESS,
  },
  {
    ...BASE,
    key: "archimate.business.process",
    group: "Negócio",
    label: "Business Process",
    description: "Sequência de comportamentos de negócio.",
    icon: "ArrowRightLeft",
    ...BUSINESS,
  },
  {
    ...BASE,
    key: "archimate.business.service",
    group: "Negócio",
    label: "Business Service",
    description: "Serviço exposto ao ambiente.",
    icon: "Rows3",
    ...BUSINESS,
  },
  {
    ...BASE,
    key: "archimate.business.object",
    group: "Negócio",
    label: "Business Object",
    description: "Conceito de informação de negócio.",
    icon: "FileText",
    ...BUSINESS,
  },
  // --- Application layer ---
  {
    ...BASE,
    key: "archimate.application.component",
    group: "Aplicação",
    label: "Application Component",
    description: "Unidade modular de software.",
    icon: "Component",
    ...APPLICATION,
  },
  {
    ...BASE,
    key: "archimate.application.service",
    group: "Aplicação",
    label: "Application Service",
    description: "Serviço de aplicação exposto.",
    icon: "Rows3",
    ...APPLICATION,
  },
  {
    ...BASE,
    key: "archimate.application.function",
    group: "Aplicação",
    label: "Application Function",
    description: "Comportamento automatizado de um componente.",
    icon: "Cpu",
    ...APPLICATION,
  },
  {
    ...BASE,
    key: "archimate.application.dataobject",
    group: "Aplicação",
    label: "Data Object",
    description: "Dado processado por aplicações.",
    icon: "Database",
    ...APPLICATION,
  },
  // --- Technology layer ---
  {
    ...BASE,
    key: "archimate.technology.node",
    group: "Tecnologia",
    label: "Node",
    description: "Recurso computacional ou físico.",
    icon: "Server",
    ...TECHNOLOGY,
  },
  {
    ...BASE,
    key: "archimate.technology.service",
    group: "Tecnologia",
    label: "Technology Service",
    description: "Serviço de infraestrutura exposto.",
    icon: "Rows3",
    ...TECHNOLOGY,
  },
  {
    ...BASE,
    key: "archimate.technology.device",
    group: "Tecnologia",
    label: "Device",
    description: "Recurso físico de computação.",
    icon: "HardDrive",
    ...TECHNOLOGY,
  },
  {
    ...BASE,
    key: "archimate.technology.system",
    group: "Tecnologia",
    label: "System Software",
    description: "Software de ambiente (OS, DBMS...).",
    icon: "SquareTerminal",
    ...TECHNOLOGY,
  },
  // --- Motivation ---
  {
    ...BASE,
    key: "archimate.motivation.stakeholder",
    group: "Motivação",
    label: "Stakeholder",
    description: "Parte interessada na arquitetura.",
    icon: "Users",
    ...MOTIVATION,
  },
  {
    ...BASE,
    key: "archimate.motivation.driver",
    group: "Motivação",
    label: "Driver",
    description: "Condição que motiva mudança.",
    icon: "Compass",
    ...MOTIVATION,
  },
  {
    ...BASE,
    key: "archimate.motivation.goal",
    group: "Motivação",
    label: "Goal",
    description: "Estado desejado a atingir.",
    icon: "Target",
    ...MOTIVATION,
  },
  {
    ...BASE,
    key: "archimate.motivation.requirement",
    group: "Motivação",
    label: "Requirement",
    description: "Necessidade a ser satisfeita.",
    icon: "ClipboardCheck",
    ...MOTIVATION,
  },
];
