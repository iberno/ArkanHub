# TODO — Desenvolvimento Plataforma ITSM

## Setup Inicial

- [ ] Inicializar repositório Git
- [ ] Configurar monorepo (apps/server + apps/web)
- [ ] Configurar TypeScript no backend e frontend
- [ ] Configurar ESLint + Prettier + Husky
- [ ] Configurar Docker + Docker Compose (PostgreSQL + Redis)
- [ ] Configurar Prisma ORM + schema inicial
- [ ] Configurar NestJS (app server)
- [ ] Configurar Vite + React + Tailwind + DaisyUI (app web)

---

## Fase 1 — MVP

### Core

- [ ] **Auth** — Módulo de autenticação (NestJS)
  - [ ] POST /auth/login
  - [ ] POST /auth/refresh
  - [ ] POST /auth/logout
  - [ ] JWT Access Token (15min) + Refresh Token (7 dias)
  - [ ] Proteção de rotas com guards
  - [ ] Rate limiter + Helmet + CORS
- [ ] **Users** — CRUD de usuários
  - [ ] GET /users
  - [ ] POST /users
  - [ ] PATCH /users/:id
  - [ ] DELETE /users/:id (soft delete)
  - [ ] Roles & Permissions (RBAC)
  - [ ] Seed de perfis: Administrador, Supervisor, Técnico, Solicitante, Gestor
- [ ] **Tickets** — CRUD de tickets
  - [ ] GET /tickets (listagem com filtros)
  - [ ] POST /tickets
  - [ ] GET /tickets/:id
  - [ ] PATCH /tickets/:id
  - [ ] Protocolo automático
  - [ ] Fluxo: Abertura → Classificação → Priorização → Atendimento → Resolução → Encerramento
- [ ] **Comentários** em tickets
  - [ ] POST /tickets/:id/comments
  - [ ] Comentários públicos e internos
- [ ] **Anexos** em tickets
  - [ ] POST /tickets/:id/attachments
  - [ ] Upload/download de arquivos
- [ ] **Dashboard básico**
  - [ ] Tickets abertos
  - [ ] Tickets críticos
  - [ ] SLA violados
- [ ] **SLA simples**
  - [ ] CRUD de SLAs
  - [ ] Cálculo de SLA por prioridade
  - [ ] Eventos: iniciado, violado, concluído

### Frontend

- [ ] Tela de login
- [ ] Layout base com sidebar + header
- [ ] CRUD de usuários (tabela + formulário)
- [ ] Lista de tickets com filtros
- [ ] Página de detalhe do ticket
- [ ] Formulário de criação de ticket
- [ ] Dashboard MVP

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

- [ ] Docker Compose para desenvolvimento
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
