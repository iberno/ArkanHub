# TODO — Desenvolvimento Plataforma ITSM

## Setup Inicial

- [x] Inicializar repositório Git
- [x] Configurar monorepo (apps/server + apps/web)
- [x] Configurar TypeScript no backend e frontend
- [ ] Configurar ESLint + Prettier + Husky
- [ ] ~~Configurar Docker + Docker Compose (PostgreSQL + Redis)~~ (sem suporte)
- [x] Configurar Prisma ORM + schema inicial
- [x] Configurar NestJS (app server)
- [x] Configurar Vite + React + Tailwind + DaisyUI (app web)

---

## Fase 1 — MVP

### Core

- [x] **Auth** — Módulo de autenticação (NestJS)
  - [x] POST /auth/login
  - [x] POST /auth/refresh
  - [x] POST /auth/logout
  - [x] JWT Access Token (15min) + Refresh Token (7 dias)
  - [ ] Proteção de rotas com guards (JwtAuthGuard)
  - [x] Rate limiter + Helmet + CORS
- [x] **Users** — CRUD de usuários
  - [x] GET /users
  - [x] POST /users
  - [x] PATCH /users/:id
  - [x] DELETE /users/:id (soft delete)
  - [ ] Roles & Permissions (RBAC) — endpoints pendentes
  - [ ] Seed de perfis: Administrador, Supervisor, Técnico, Solicitante, Gestor
- [x] **Tickets** — CRUD de tickets
  - [x] GET /tickets (listagem sem filtros)
  - [x] POST /tickets
  - [x] GET /tickets/:id
  - [x] PATCH /tickets/:id
  - [x] Protocolo automático
  - [x] Fluxo: statuses (Aberto → Em Andamento → Aguardando → Resolvido → Fechado)
- [ ] **Comentários** em tickets
  - [ ] POST /tickets/:id/comments
  - [ ] Comentários públicos e internos
- [ ] **Anexos** em tickets
  - [ ] POST /tickets/:id/attachments
  - [ ] Upload/download de arquivos
- [x] **Dashboard básico** (frontend estático)
  - [x] Tickets abertos
  - [x] Tickets críticos
  - [x] SLA violados
- [ ] **SLA simples**
  - [ ] CRUD de SLAs
  - [ ] Cálculo de SLA por prioridade
  - [ ] Eventos: iniciado, violado, concluído

### Frontend

- [x] Tela de login
- [x] Layout base com sidebar + header (mobile-first, 4K)
- [x] Toggle de tema (wireframe/business)
- [ ] CRUD de usuários (tabela + formulário) — apenas estrutura inicial
- [x] Lista de tickets com filtros — apenas estrutura inicial
- [x] Página de detalhe do ticket — apenas estrutura inicial
- [ ] Formulário de criação de ticket
- [x] Dashboard MVP — apenas estrutura inicial

---

## Fase 2

- [ ] **Aprovações** multinível
  - [ ] Approval flows
  - [ ] Approval steps
  - [ ] POST /approvals/:id/approve
  - [ ] POST /approvals/:id/reject
- [ ] **Workflow** — Motor de automações
  - [ ] Regras + condições + ações
  - [ ] Execução automática (ex: se categoria ERP → atribuir grupo SAP)
- [ ] **Realtime** com Socket.IO
  - [ ] Atualização de tickets
  - [ ] Chat interno
  - [ ] SLA countdown
- [ ] **Notificações**
  - [ ] E-mail (transacionais)
  - [ ] Notificações internas (no sistema)
  - [ ] Push (futuro)
- [ ] **Base de Conhecimento**
  - [ ] CRUD de artigos
  - [ ] Categorias
  - [ ] Versionamento de artigos

---

## Fase 3

- [ ] **Problemas**
  - [ ] RCA (Root Cause Analysis)
  - [ ] Workarounds
  - [ ] Erros conhecidos
- [ ] **Mudanças** (Changes)
  - [ ] RFC
  - [ ] Aprovação CAB
  - [ ] Planejamento → Execução → Validação → Encerramento
- [ ] **Relatórios avançados**
- [ ] **BI** — Indicadores (MTTR, MTTA, CSAT, Backlog)
- [ ] **CMDB** (futuro)

---

## Fase 4 — IA & Automação

- [ ] Classificação automática de tickets (NLP)
- [ ] Chatbot
- [ ] Predição de SLA
- [ ] Recomendação de soluções (knowledge base)

---

## Infra & DevOps

- [ ] ~~Docker Compose para desenvolvimento~~ (sem suporte)
- [ ] CI/CD com GitHub Actions
- [ ] Ambientes: DEV → HML → PRD
- [ ] NGINX como reverse proxy
- [ ] Sentry para monitoramento de erros
- [ ] Prometheus + Grafana (futuro)

---

## Testes

- [ ] Backend: testes unitários (Jest)
- [ ] Backend: testes de integração
- [ ] Frontend: testes de componentes
- [ ] E2E (Cypress/Playwright)

---

## Extras / Futuro

- [ ] Multi-tenant (empresas)
- [ ] White-label
- [ ] Integração com Active Directory / LDAP
- [ ] Integração com Microsoft 365 / Teams / Slack
- [ ] Integração com Zabbix / Grafana / Jira
- [ ] Event Sourcing + CQRS
- [ ] Microsserviços
