# Visão de Arquitetura — Banco SP

**Produto:** Engajamento & Aceleração de Lançamentos
**Autor:** Time de Enterprise Architecture
**Fase TOGAF:** A — Architecture Vision
**Linguagem de modelagem:** ArchiMate / C4 (notação do Enterprise Architecture Studio)

> Os diagramas citados estão nesta pasta como `.eas.json` e abrem no app via **Biblioteca → Importar**.

---

## 1. Sumário Executivo (a decisão)

| Pergunta do C-Level | Recomendação do EA | Lastro |
|---|---|---|
| Conta de Pagamentos **ou** Cashback? | **Conta de Pagamentos** | É um **Core Domain** (DDD): gera conta/saldo/movimentação, é pré-requisito do Cashback e habilita float, dados transacionais e novos produtos. Cashback é **Supporting** e depende de uma conta para pontuar/resgatar. |
| Adquirir plataforma de **Core Bancário**? | **Não adquirir um core monolítico. Compor capacidades.** | O estilo vigente e desejado é **Microservices**. Um core "caixa-preta" reintroduz acoplamento e silo — exatamente o problema a resolver. Adquirir **capacidades pontuais** (KYC, Ledger, antifraude) como BaaS/SaaS onde são *generic domains*. |
| Como acelerar lançamentos? | **Plataforma de capacidades reutilizáveis** + padrão Strangler sobre o legado | Silos sem reuso são a causa-raiz da lentidão. Capacidades compartilhadas (Identity, Payments, Ledger, Notification) viram *building blocks* reaproveitáveis. |

**Em uma frase:** habilitar **Conta de Pagamentos** como núcleo transacional, construir uma **plataforma de capacidades em microservices** (não comprar core fechado) e migrar o legado por **Strangler Fig** em arquiteturas de transição.

---

## 2. Problema de Negócio (Subdomínios — DDD estratégico)
*Diagrama: `02 - Mapa de Problemas de Negocio (Subdominios DDD)`*

| Classe DDD | Subdomínios | Decisão de sourcing |
|---|---|---|
| **Core** (diferenciação) | Conta de Pagamentos, Originação de Crédito, Motor de Decisão/Risco | **Build** — construir e evoluir internamente |
| **Supporting** (competitividade) | Cashback & Parcerias, Cartões, Cobrança | **Build/Partner** — priorizar depois do core |
| **Generic** (comoditizado) | KYC/Onboarding, Ledger, Notificação, Fraude/AML | **Buy/BaaS** — adquirir capacidade pontual |

Isso responde diretamente ao CTO: o valor de "adquirir" existe, mas **apenas nos generic domains**, não no core inteiro.

---

## 3. Capacidades de Negócio e Classificação
*Diagrama: `03 - Mapa de Capacidades de Negocio`*

- **Diferenciação:** Gestão de Conta de Pagamentos, Motor de Pagamentos (Pix/TED/Boleto), Originação & Decisão de Crédito.
- **Competitividade:** Cashback & Parcerias, Gestão de Cartões, Engajamento & Ofertas.
- **Comoditizadas / Fundacionais:** Identidade & KYC, Ledger & Conciliação, Prevenção a Fraude/AML, Notificações.

Capacidades fundacionais são **compartilhadas** por todos os produtos — é o que quebra os silos e acelera o próximo lançamento.

---

## 4. Cadeia de Valor e Fluxos de Valor
- **Value Chain** (`04`): Aquisição → Abertura de Conta → Movimentação & Pagamentos → Engajamento → Suporte, com agrupamentos de apoio (Risco & Compliance, Ledger & Finanças, Plataforma & Dados, Atendimento).
- **Value Stream "Realizar um Pagamento"** (`05`): Iniciar → Autenticar → Validar Saldo → Executar → Liquidar → Notificar/Fidelizar, com os **serviços de aplicação** que suportam cada etapa (interoperabilidade de funcionalidades).

O legado em silo impacta a cadeia porque cada produto reimplementa onboarding, identidade e ledger — custo e tempo duplicados a cada lançamento.

---

## 5. Requisitos e Classificação

| # | Requisito | Tipo | Prioridade |
|---|---|---|---|
| R1 | Habilitar Conta de Pagamentos (conta, saldo, Pix) | Funcional | Must |
| R2 | Plataforma de capacidades reutilizáveis (building blocks) | Não-funcional / Arquitetural | Must |
| R3 | Preservar estilo Microservices | Restrição arquitetural | Must |
| R4 | KYC, Ledger e Antifraude via BaaS/SaaS | Funcional / Sourcing | Should |
| R5 | Observabilidade e trilhas de auditoria (BACEN/LGPD) | Não-funcional / Regulatório | Must |
| R6 | Cashback como produto subsequente sobre a conta | Funcional | Could |

---

## 6. Funcionalidades que Emergiram
Onboarding/KYC, Identity & AuthZ, Account & Balance, Payments Engine (Pix/TED/Boleto), Ledger, Rewards/Cashback, Fraud & AML, Notification — cada uma candidata a **microservice** (ver seção 7).

---

## 7. Arquitetura Alvo (TO-BE) e Decomposição de Microservices
*Diagrama: `06 - Arquitetura Alvo TO-BE (Microservices C4)`*

**Padrão de decomposição:** *decompose by subdomain (DDD)* + *bounded context = service*.
Cada microservice mapeia um bounded context e possui **database-per-service**; integração assíncrona por **Event Bus (Kafka)** — padrões Saga/Event-driven para consistência e desacoplamento.

Building Blocks (ABBs/SBBs):
- **Platform BBs:** API Gateway/BFF, Identity & AuthZ, Event Bus, Observability.
- **Product BBs:** Accounts, Payments Engine, Ledger, Cashback.
- **Compliance BBs:** Fraud & AML, Audit/Reporting.

**Estilos arquiteturais** impactados pela Visão: Microservices, Event-Driven Architecture, API-led/BFF, e Build-vs-Buy por subdomínio. Mantêm-se os princípios de *loose coupling* e *high cohesion*.

---

## 8. Como Migrar — Arquiteturas Intermediárias
*Diagrama: `07 - Roadmap de Migracao`*

1. **AS-IS:** monólitos de empréstimo/cartão em silo, sem reuso.
2. **Transição 1 — Fundação:** API Gateway, Identity, Event Bus, KYC (SaaS). Nenhum produto novo ainda; só plataforma.
3. **Transição 2 — Conta de Pagamentos:** Accounts + Payments Engine + Ledger sobre a fundação. Primeiro valor ao cliente.
4. **Transição 3 — Reuso & Strangler:** extrair capacidades do legado (originação, cartões) para a plataforma, substituindo o monólito gradualmente.
5. **TO-BE:** plataforma de capacidades reutilizáveis; próximos produtos (incl. Cashback) montam-se por composição.

Padrão de migração: **Strangler Fig** — risco controlado, sem big-bang, preservando operação regulada.

---

## 9. Por que estes frameworks (lastro metodológico)
- **TOGAF ADM Fase A:** o case pede explicitamente uma *Visão de Arquitetura* e um *plano de migração* (Fases E/F) — o ADM organiza isso.
- **DDD (estratégico e tático):** classifica subdomínios (core/supporting/generic) para guiar build-vs-buy e define bounded contexts = fronteira dos microservices.
- **Business Capability Map / Value Stream (banking):** linguagem de negócio neutra para priorizar investimento e expor o custo dos silos.
- **C4 + ArchiMate:** C4 para a arquitetura de solução (containers/microservices); ArchiMate para motivação, negócio e capacidades.

---

## 10. Como abrir os artefatos no app
1. `npm run dev` na raiz do projeto.
2. Barra superior → ícone **Importar** (seta para cima) → selecione cada `*.eas.json` desta pasta.
3. Ajuste layout/zoom e exporte em **PDF/PNG/SVG** para a apresentação ao C-Level.
