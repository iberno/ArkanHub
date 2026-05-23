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

## Fase 1 — MVP ✅

### Core

- [x] **Auth** — Módulo de autenticação (NestJS)
  - [x] POST /auth/login
  - [x] POST /auth/refresh
  - [x] POST /auth/logout
  - [x] JWT Access Token (15min) + Refresh Token (7 dias)
  - [x] Proteção de rotas com guards (JwtAuthGuard global + @Public())
  - [x] Rate limiter (@nestjs/throttler: 30 req/min) + Helmet + CORS
- [x] **Users** — CRUD de usuários
  - [x] GET /users
  - [x] POST /users
  - [x] PATCH /users/:id
  - [x] DELETE /users/:id (soft delete)
  - [x] Roles & Permissions (RBAC) — 6 endpoints roles + 3 endpoints permissions
  - [x] Seed de perfis: admin, supervisor, technician, requester, gestor
  - [x] Associação Users x Roles (POST/DELETE /users/:id/roles/:roleId)
- [x] **Tickets** — CRUD de tickets
  - [x] GET /tickets (listagem sem filtros)
  - [x] POST /tickets
  - [x] GET /tickets/:id
  - [x] PATCH /tickets/:id
  - [x] Protocolo automático
  - [x] Fluxo: statuses (Aberto → Em Andamento → Aguardando → Resolvido → Fechado)
- [x] **Comentários** em tickets
  - [x] POST /tickets/:id/comments
  - [x] Comentários públicos e internos
- [x] **Anexos** em tickets
  - [x] POST /tickets/:id/attachments
  - [x] Upload/download de arquivos
- [x] **Dashboard básico** (frontend dinâmico)
  - [x] Tickets abertos
  - [x] Tickets críticos
  - [x] SLA violados
- [x] **SLA simples**
  - [x] CRUD de SLAs (GET, POST, PATCH, DELETE)
  - [x] Cálculo de SLA por prioridade (endpoint calculate)
  - [x] Seed com 3 SLAs (Corporativo, VIP, P1) + regras + horário comercial

### Frontend

- [x] Tela de login funcional (conectada à API)
- [x] Layout base com sidebar + header (mobile-first, 4K, colapsável)
- [x] Toggle de tema (wireframe/business)
- [x] CRUD de usuários (tabela + formulário)
- [x] RBAC: cards de papéis com permissões, edição, associação de usuários
- [x] Lista de tickets com filtros (busca + status)
- [x] Página de detalhe do ticket (info + comentários)
- [x] Formulário de criação de ticket (modal)
- [x] Dashboard com dados reais

---

## Fase 2 ✅

- [x] **Aprovações** multinível
  - [x] CRUD de fluxos (approval-flows)
  - [x] CRUD de etapas (steps com stepOrder + approverType)
  - [x] POST /approval-requests/:id/approve
  - [x] POST /approval-requests/:id/reject
  - [x] Fluxo multi-etapas (currentStep avança até aprovação total)
  - [x] Frontend: página /approvals com cards + modais
- [x] **Base de Conhecimento**
  - [x] CRUD de artigos (GET, POST, PATCH, DELETE)
  - [x] Categorias (CRUD inline + filtro)
  - [x] Versionamento automático de artigos (versão criada ao alterar conteúdo)
  - [x] Restauração de versão anterior
  - [x] Frontend: página /knowledge com grid, modais create/edit/detail/versões
- [x] **Notificações** internas
  - [x] GET /notifications (listar do usuário)
  - [x] GET /notifications/unread/count
  - [x] POST /notifications (criar), PATCH /:id/read, PATCH /read-all, DELETE /:id
  - [x] Sino no header com badge de não lidas (polling 30s)
  - [x] Frontend: página /notifications com lista completa
- [x] **Realtime** com Socket.IO
  - [x] Gateway JWT (namespace /ws, auth via handshake)
  - [x] Salas user:{id} para notificações individuais
  - [x] Salas ticket:{id} para atualizações de ticket
  - [x] Eventos: ticket:created, ticket:updated, comment:new, notification:new, notification:unread
  - [x] Frontend: useSocket hook + atualização em tempo real do badge notificações
  - [x] Vite proxy /socket.io com ws: true
- [x] **Workflow** — Motor de automações
  - [x] Regras (CRUD: name, active)
  - [x] Condições (field + operator + value): equals, not_equals, contains, in, gt, lt
  - [x] Ações (actionType + payload JSON): change_status, change_priority, assign_user, add_comment, send_notification
  - [x] Execução automática ao criar/atualizar ticket
  - [x] Histórico de execuções
  - [x] Frontend: página /workflows com cards, modais condição/ação, toggle ativar, histórico

---

## Fase 3 ✅

- [x] **Problemas**
  - [x] CRUD de problemas (status: open → investigating → root_cause_identified → resolved → closed)
  - [x] RCA (Root Cause Analysis) — campos rootCause, workaround, solution
  - [x] Erros conhecidos (KnownError) vinculados a problemas ou independentes
  - [x] Frontend: página /problems com cards, modais create/edit/detail + nested known errors
- [x] **Mudanças** (Changes)
  - [x] CRUD de mudanças (status: draft → pending_review → approved → rejected → scheduled → implementing → validating → closed)
  - [x] Aprovação CAB (ChangeApproval com multi-aprovadores)
  - [x] Planejamento → Execução → Validação → Encerramento (implementationPlan, rollbackPlan, testPlan, scheduledAt)
  - [x] Frontend: página /changes com cards, modais create/edit/detail + approvals
- [x] **BI & Relatórios avançados**
  - [x] Overview: total, backlog, críticos, MTTR, MTTA, SLA compliance
  - [x] Distribuição por status, prioridade, categoria
  - [x] Tendência diária (criados vs resolvidos)
  - [x] Frontend: página /reports com cards + gráficos CSS (sem lib externa)
- [ ] **CMDB** (futuro)

---

## Refinamentos & Ajustes ✅

- [x] **Upload de arquivos/imagens** — Componente FileUpload reutilizável com drag & drop + preview
  - [x] Anexos em tickets: upload na criação e no detalhe
  - [x] Avatar de usuário: upload com preview no edit modal e perfil
  - [x] Static file serving via Express (`/uploads`)
- [x] **Cadastro de usuário** — Campos adicionados: telefone, cargo, empresa, departamento, status
  - [x] UserCreateModal e UserEditModal com selects de empresa/departamento encadeados
  - [x] Tabela de usuários com colunas expandidas (avatar, cargo, empresa, departamento, telefone)
- [x] **"A pedido de" → "Beneficiário"** — Rótulo renomeado no TicketCreateModal e TicketDetailModal
- [x] **Categorização de tickets** — Seletor de categoria no formulário de criação
  - [x] Página /ticket-categories com CRUD completo e hierarquia (pai/filho)
  - [x] Categoria exibida no detalhe do ticket
- [x] **Página de Perfil** (/profile) — Editar nome, email, telefone, cargo, senha, avatar
- [x] **Sidebar** — Link para Categorias e Perfil adicionados
- [x] **Departamentos duplicados** — Correção: seed usava `create()` em vez de `upsert()`, gerando duplicatas
  - [x] Script de deduplicação (13 pares, 21 tickets migrados)
  - [x] Unique constraint `@@unique([name, companyId])` no schema
  - [x] Seed migrado para `upsert` com chave composta `name|company`
- [x] **Reatribuição de tickets** — assignedTo em DTOs, histórico + notificação ao reassinar
  - [x] Botão "Pegar ticket" (assign to self)
  - [x] UI de reassign no TicketDetailModal (select de técnicos)
  - [x] Filtros "Meus tickets" e "Não atribuídos" na listagem
- [x] **Toast notifications** — Zustand store + ToastContainer (DaisyUI .toast)
  - [x] SocketListener global cria toast ao receber `notification:new`
  - [x] Auto-dismiss 6s, clique navega para /tickets
- [x] **Sidebar categorizado por role** — 6 grupos (Dashboard, Atendimento, Administração, Processos, Relatórios, Pessoal)
  - [x] Itens filtrados por `requiredPermission` via config centralizada em `config/navigation.ts`
- [x] **Página padrão por role** — Redirecionamento pós-login e rota raiz conforme perfil
  - [x] admin → Dashboard, technician → /tickets, gestor → /approvals, coord_projetos → /changes, etc.
- [x] **Roles/permissions no login** — Backend retorna `user.roles[]` e `user.permissions[]`
  - [x] Auth store expõe `hasPermission(key)` e `hasRole(role)`
- [x] **Pesquisa de Satisfação** — Modelo TicketSatisfaction (1-5 estrelas + comentário)
  - [x] Backend: GET/POST /tickets/:id/satisfaction, GET /satisfaction/stats
  - [x] Frontend: StarRating component + survey UI no TicketDetailModal (só quando Resolvido/Fechado)
  - [x] `resolvedAt`/`closedAt` automáticos ao mudar status
- [x] **BI & Relatórios expandido**
  - [x] Relatório mensal (últimos 12 meses) com criados, resolvidos, variação % (MoM), satisfação
  - [x] Performance por departamento (tempo médio, SLA%, tickets resolvidos)
  - [x] Satisfação no overview (média, NPS, distribuição 1-5)
  - [x] Dashboard com cards de satisfação (média, NPS, gráfico de barras)
- [x] **Seed de 1200 tickets falsos** — `prisma/seed-1200.ts`
  - [x] Distribuição realista por status conforme idade (mais antigos → mais resolvidos)
  - [x] ~240 tickets/mês nos últimos 5 meses
  - [x] Apenas usuários ArkanHub como atendentes (assignees)
  - [x] Usuários de outras empresas como solicitantes
  - [x] ~35% dos resolvidos/fechados com avaliação de satisfação
  - [x] ~22% com histórico de reatribuição
  - [x] ~55% com 1-3 comentários

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

- [x] Multi-tenant (empresas, departamentos, clientes)
- [ ] White-label
- [ ] Integração com Active Directory / LDAP
- [ ] Integração com Microsoft 365 / Teams / Slack
- [ ] Integração com Zabbix / Grafana / Jira
- [ ] Event Sourcing + CQRS
- [ ] Microsserviços
