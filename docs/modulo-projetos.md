# Módulo de Projetos (PMI)

## 1. Conceito

Módulo completo de gerenciamento de projetos estilo PMI, integrado ao ciclo ITSM. Projetos podem ser criados do zero ou convertidos a partir de tickets. Tickets vinculados a um projeto funcionam como tarefas do projeto, reutilizando todo o fluxo ITSM (status, comentários, anexos, aprovações).

## 2. Modelo de Dados

```prisma
model Project {
  id              String   @id @default(uuid())
  name            String
  description     String?
  charter         String?         // Documento de abertura do projeto
  managerId       String          // Gerente do projeto (FK → User)
  status          String          // Draft | Planned | In Progress | Completed | Cancelled
  priority        String          // Baixa | Média | Alta | Crítica
  startDate       DateTime?
  targetEndDate   DateTime?
  actualEndDate   DateTime?
  estimatedBudget Float?
  actualBudget    Float?

  manager      User              @relation("project_manager")
  tickets      Ticket[]
  phases       ProjectPhase[]
  risks        ProjectRisk[]
  stakeholders ProjectStakeholder[]
  milestones   ProjectMilestone[]
}

model ProjectPhase {
  projectId   String
  name        String
  description String?
  order       Int
  startDate   DateTime?
  endDate     DateTime?
  tickets     Ticket[]
}

model ProjectRisk {
  projectId   String
  description String
  probability String    // Baixo | Médio | Alto
  impact      String    // Baixo | Médio | Alto
  mitigation  String?
  status      String    // Aberto | Mitigado | Fechado
  ownerId     String?   // FK → User
  owner       User?     @relation("project_risk_owner")
}

model ProjectStakeholder {
  projectId String
  userId    String           // FK → User
  role      String           // Sponsor | Project Manager | Team Member | Stakeholder | Client
  user      User
  @@unique([projectId, userId])
}

model ProjectMilestone {
  projectId   String
  name        String
  description String?
  date        DateTime
  completed   Boolean
  completedAt DateTime?
}
```

### Integração com Ticket

O model `Ticket` ganhou dois campos opcionais:

```prisma
model Ticket {
  // ... campos existentes
  projectId      String?   @map("project_id")
  projectPhaseId String?   @map("project_phase_id")
  project        Project?      @relation
  projectPhase   ProjectPhase? @relation
}
```

Isso permite:
- Vincular tickets a um projeto
- Organizar tickets por fase dentro do projeto
- Criar tickets diretamente no contexto do projeto

## 3. Endpoints

### Projetos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/projects` | Listar projetos |
| GET | `/api/projects/:id` | Obter projeto (com fases, riscos, stakeholders, milestones, tickets) |
| POST | `/api/projects` | Criar projeto |
| PATCH | `/api/projects/:id` | Atualizar projeto |
| DELETE | `/api/projects/:id` | Remover projeto |
| POST | `/api/projects/from-ticket/:ticketId` | Converter ticket em projeto |

### Fases

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/projects/:id/phases` | Adicionar fase |
| PATCH | `/api/projects/phases/:phaseId` | Atualizar fase |
| DELETE | `/api/projects/phases/:phaseId` | Remover fase |

### Riscos

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/projects/:id/risks` | Adicionar risco |
| PATCH | `/api/projects/risks/:riskId` | Atualizar risco |
| DELETE | `/api/projects/risks/:riskId` | Remover risco |

### Stakeholders

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/projects/:id/stakeholders` | Adicionar stakeholder |
| DELETE | `/api/projects/stakeholders/:stakeholderId` | Remover stakeholder |

### Milestones

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/projects/:id/milestones` | Adicionar milestone |
| PATCH | `/api/projects/milestones/:milestoneId` | Atualizar milestone |
| DELETE | `/api/projects/milestones/:milestoneId` | Remover milestone |

## 4. Fluxos

### Converter ticket em projeto

```
[Detail do ticket → "Converter em Projeto"]
        │
        ▼
[Modal inline com nome do projeto]
        │
        ▼
[POST /projects/from-ticket/:ticketId]
        │
        ├── Cria Project com charter = "Ticket origem: TK-XXX — título"
        ├── Vincula ticket ao projeto (ticket.projectId = project.id)
        └── Redireciona para /projects/:id
```

### Criar projeto do zero

```
[Lista de projetos → "Novo Projeto"]
        │
        ▼
[Modal ProjectCreateModal]
  • Nome, descrição, gerente, prioridade
  • Datas de início e previsão de término
        │
        ▼
[POST /projects] → Redireciona para lista
```

### Gerenciar tickets no projeto

```
[Detail do projeto → Aba "Tickets"]
        │
        ├── Lista tickets vinculados
        └── Botão "Novo ticket no projeto"
              │
              ▼
        /tickets/new?projectId={id}
              │
              ▼
        Ticket criado já vinculado ao projeto
```

## 5. Frontend

### Páginas

| Rota | Arquivo | Conteúdo |
|------|---------|----------|
| `/projects` | `pages/Projects.tsx` | Lista em grid com cards |
| `/projects/:id` | `pages/ProjectDetail.tsx` | Detalhe com 4 abas |

### Componentes

| Componente | Arquivo |
|------------|---------|
| `ProjectCreateModal` | `components/projects/ProjectCreateModal.tsx` |

### Abas do Detalhe

| Aba | Conteúdo |
|-----|----------|
| **Visão Geral** | Charter, status (botões de transição), marcos (checklist), fases, dados financeiros |
| **Tickets** | Tabela de tickets vinculados + "Novo ticket no projeto" |
| **Riscos** | Lista com probabilidade/impacto/mitigação, CRUD completo |
| **Equipe** | Membros com papel (Sponsor, Gerente, Membro...), CRUD completo |

### Serviço

`apps/web/src/services/projects.ts` — todos os métodos CRUD para projetos e sub-recursos.

### Tipos

Adicionados em `apps/web/src/types/api.ts`:
- `Project`, `ProjectPhase`, `ProjectRisk`, `ProjectStakeholder`, `ProjectMilestone`

### Navegação

`apps/web/src/config/navigation.ts` — entrada "Projetos" no menu lateral, categoria "Projetos", permissão `project.manage`.

## 6. Permissões

| Chave | Descrição |
|-------|-----------|
| `project.manage` | Gerenciar projetos (usada para exibir o menu) |
| `project.create` | Criar projetos |
| `project.edit` | Editar projetos |
| `project.delete` | Excluir projetos |
| `project.manage-tasks` | Gerenciar tickets do projeto |
| `project.manage-team` | Gerenciar equipe |

## 7. Arquivos Criados/Alterados

### Schema
- `apps/server/prisma/schema.prisma` — Project + sub-modelos + projectId/projectPhaseId no Ticket + relações no User

### Backend
- `apps/server/src/modules/projects/projects.module.ts`
- `apps/server/src/modules/projects/projects.service.ts`
- `apps/server/src/modules/projects/projects.controller.ts`
- `apps/server/src/modules/projects/dto/create-project.dto.ts`
- `apps/server/src/modules/projects/dto/update-project.dto.ts`
- `apps/server/src/app.module.ts` — import ProjectsModule

### Frontend
- `apps/web/src/types/api.ts` — interfaces Project*
- `apps/web/src/services/projects.ts` — service
- `apps/web/src/config/navigation.ts` — menu entry
- `apps/web/src/routes/index.tsx` — rotas /projects e /projects/:id
- `apps/web/src/pages/Projects.tsx` — listagem
- `apps/web/src/pages/ProjectDetail.tsx` — detail com abas
- `apps/web/src/components/projects/ProjectCreateModal.tsx` — modal de criação
- `apps/web/src/components/tickets/TicketDetailModal.tsx` — "Converter em Projeto"

### Seed
- `apps/server/prisma/seed.ts` — novas permissões `project.*`

## 8. Observações

- Ao converter ticket em projeto, o charter é preenchido automaticamente com os dados do ticket origem
- Mudar status para "Completed" ou "Cancelled" preenche `actualEndDate` automaticamente
- O orçamento real (`actualBudget`) pode ser atualizado manualmente via PATCH
- Tickets criados via `?projectId=` no formulário de novo ticket já nascem vinculados ao projeto
- O modal de criação de projeto usa o mesmo padrão dos demais modais da aplicação (dialog + form)
