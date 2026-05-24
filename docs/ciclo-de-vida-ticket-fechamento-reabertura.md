# Ciclo de Vida do Ticket — Fechamento e Reabertura

## 1. Conceito

O ticket percorre um ciclo de vida que vai da criação até o fechamento. Após resolvido, o ticket pode ser:

- **Fechado automaticamente** — quando o cliente avalia a satisfação com nota >= 3 (aprovado)
- **Fechado automaticamente após timeout** — quando ultrapassa o `autoCloseHours` configurado no SLA (pendente de implementação)
- **Reaberto** — somente se estiver com status "Resolvido"
- **Criado como relacionado** — se estiver "Fechado", não pode ser reaberto; um novo ticket é criado e vinculado ao anterior via `TicketRelation`
- **Criação em lote** — tickets em massa para incidentes recorrentes com múltiplos solicitantes

## 2. Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| Aprovação | Rating >= 3 na pesquisa de satisfação = aprovado |
| Rejeição | Rating 1 ou 2 = não aprovado (ticket permanece "Resolvido") |
| Reabertura | Só permitida se status atual = "Resolvido" |
| Ticket Fechado | Não pode ser reaberto. Usuário deve criar novo ticket relacionado |
| Timeout auto-close | `Sla.autoCloseHours` define prazo após "Resolvido" para fechamento automático |

## 3. Modelo de Dados

### Sla.autoCloseHours

```prisma
model Sla {
  id              String   @id @default(uuid())
  name            String   @unique
  responseTime    Int      @map("response_time")
  resolutionTime  Int      @map("resolution_time")
  autoCloseHours  Int?     @default(72) @map("auto_close_hours")
  // ...
}
```

Campo opcional que define em horas o prazo para fechamento automático após o ticket ser resolvido. Default: 72h (3 dias).

### TicketRelation

```prisma
model TicketRelation {
  id              String   @id @default(uuid())
  ticketId        String   @map("ticket_id")
  relatedTicketId String   @map("related_ticket_id")
  type            String   @default("substitute") // substitute | related | duplicate
  createdAt       DateTime @default(now()) @map("created_at")

  ticket        Ticket @relation("ticket_relations")
  relatedTicket Ticket @relation("related_ticket_relations")

  @@unique([ticketId, relatedTicketId])
  @@map("ticket_relations")
}
```

Tabela junction N:N entre tickets. O `type` "substitute" indica que o novo ticket substitui o anterior. A `@@unique` previne duplicidade na mesma direção.

### Ticket (relações adicionadas)

```prisma
model Ticket {
  // ...
  ticketRelations  TicketRelation[] @relation("ticket_relations")
  relatedTickets   TicketRelation[] @relation("related_ticket_relations")
}
```

- `ticketRelations`: relações onde este ticket é o principal (ticketId)
- `relatedTickets`: relações onde este ticket é o relacionado (relatedTicketId)

## 4. Fluxos

### 4.1 Auto-close por satisfação

```
[Usuário avalia ticket Resolvido]
        │
        ▼
[SatisfactionService.upsert()]
        │
        ├── rating >= 3? ──Sim──► [Busca status "Fechado"]
        │                              │
        │                              ▼
        │                    [Ticket.update: statusId="Fechado", closedAt=now()]
        │
        └── rating < 3? ──► [Ticket permanece "Resolvido"]
```

Implementado em: `apps/server/src/modules/satisfaction/satisfaction.service.ts:42-53`

### 4.2 Reabertura

```
[Usuário clica "Reabrir ticket"]
        │
        ▼
[POST /tickets/:id/reopen]
        │
        ├── status === "Resolvido"? ──Sim──► [Status → "Em Andamento"]
        │     │                                     │
        │     │                                     ▼
        │     │                            [resolvedAt = null]
        │     │                            [closedAt = null]
        │     │                            [Cria TicketHistory]
        │     │
        │     └── Não ──► [ConflictException: "Só é possível reabrir tickets Resolvido"]
        │
        └── Ticket não encontrado? ──► [NotFoundException]
```

Implementado em:
- Controller: `apps/server/src/modules/tickets/tickets.controller.ts:57-64`
- Service: `apps/server/src/modules/tickets/tickets.service.ts:260-316`

### 4.3 Novo ticket relacionado (Fechado)

```
[Usuário clica "Criar novo ticket relacionado"]
        │
        ▼
[Navega para /tickets/new?relatedTo={ticketFechadoId}]
        │
        ▼
[Usuário preenche formulário e submete]
        │
        ▼
[POST /tickets/:id/related]
        │
        ├── Ticket original existe? ──Sim──► [Cria novo ticket (reusa create())]
        │     │                                     │
        │     │                                     ▼
        │     │                            [Cria TicketRelation]
        │     │                             ticketId = novoTicket.id
        │     │                             relatedTicketId = ticketOriginal.id
        │     │                             type = "substitute"
        │     │
        │     └── Não ──► [NotFoundException]
        │
        └── Retorna novo ticket com relatedTickets incluso
```

Implementado em:
- Controller: `apps/server/src/modules/tickets/tickets.controller.ts:66-73`
- Service: `apps/server/src/modules/tickets/tickets.service.ts:318-347`
- Frontend: `apps/web/src/pages/TicketNew.tsx`
- Rota: `apps/web/src/routes/index.tsx` (linha 43, `/tickets/new`)

## 5. Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/tickets/:id/reopen` | Reabre ticket (Resolvido → Em Andamento) | JWT |
| POST | `/tickets/:id/related` | Cria novo ticket + link de substituição | JWT |

## 6. Frontend

### TicketDetailModal (`apps/web/src/components/tickets/TicketDetailModal.tsx`)

- **Status "Resolvido"**: Botão "Reabrir ticket" (btn-warning) na sidebar
- **Status "Fechado"**: Botão "Criar novo ticket relacionado" (btn-outline) na sidebar, navega para `/tickets/new?relatedTo={id}`
- Mutation `reopenMutation` invalida a query do ticket após sucesso

### TicketNew (`apps/web/src/pages/TicketNew.tsx`)

- Lê query param `?relatedTo` da URL
- Se presente, busca o ticket relacionado e exibe alerta informativo
- No submit, usa `ticketsService.createRelated()` em vez de `create()`

### TicketsService (`apps/web/src/services/tickets.ts`)

```typescript
async reopen(id: string): Promise<Ticket>
async createRelated(id: string, body: CreateTicketBody): Promise<Ticket>
```

### Tipos (`apps/web/src/types/api.ts`)

```typescript
export interface Ticket {
  // ...
  histories?: { id: string; field: string; oldValue: string; newValue: string; createdAt: string }[];
  ticketRelations?: { id: string; relatedTicket: Pick<Ticket, 'id' | 'protocol' | 'title'> }[];
  relatedTickets?: { id: string; ticket: Pick<Ticket, 'id' | 'protocol' | 'title'> }[];
}
```

## 7. Pendências

- [ ] **Auto-close por timeout**: Implementar job periódico que busca tickets "Resolvido" com `resolvedAt + Sla.autoCloseHours < now()` e fecha automaticamente. Requer Redis (BullMQ) ou `@nestjs/schedule`
- [ ] **Seed de SLA**: Adicionar `autoCloseHours` nos SLAs existentes no seed
- [ ] **Migração de dados**: Atualizar tickets "Resolvido" antigos que já deveriam estar fechados

## 8. Arquivos Alterados/Criados

### Schema
- `apps/server/prisma/schema.prisma` — Sla.autoCloseHours + TicketRelation + relações no Ticket

### Backend
- `apps/server/src/modules/satisfaction/satisfaction.service.ts` — Auto-close pós-avaliação
- `apps/server/src/modules/tickets/tickets.service.ts` — reopen() + createRelated()
- `apps/server/src/modules/tickets/tickets.controller.ts` — Rotas reopen e related

### Frontend
- `apps/web/src/types/api.ts` — Ticket.histories, ticketRelations, relatedTickets
- `apps/web/src/services/tickets.ts` — reopen() + createRelated()
- `apps/web/src/components/tickets/TicketDetailModal.tsx` — Botões Reabrir / Criar relacionado
- `apps/web/src/pages/TicketNew.tsx` — Suporte a ?relatedTo
- `apps/web/src/routes/index.tsx` — Rota /tickets/new ativa

## 9. Criação em Lote (Batch)

### Conceito

Quando um incidente recorrente acontece (ex: sistema fora do ar) e vários clientes ligam com o mesmo problema, o operador pode abrir tickets para todos de uma só vez. Os campos base do ticket são compartilhados (título, descrição, categoria, prioridade), mas cada ticket tem seu próprio par solicitante/beneficiário.

### Fluxo

```
[Incidente recorrente identificado]
        │
        ▼
[Operador preenche campos base do ticket]
  • Título, descrição, categoria, status, prioridade
  • Departamento, ativos, anexo
        │
        ▼
[Adiciona N solicitantes na lista]
  • Para cada cliente que ligou:
    - Nome do cliente solicitante
    - Beneficiário (default = mesmo cliente)
        │
        ▼
[Clique em "Criar N Tickets"]
        │
        ▼
[POST /api/tickets/batch]──► [N tickets criados em transação]
        │
        ▼
[Modal fecha + lista de tickets atualizada]
```

### Endpoint

```
POST /api/tickets/batch
Content-Type: application/json
Authorization: Bearer <token>

[
  {
    "title": "Sistema indisponível",
    "description": "Relato de indisponibilidade...",
    "requesterId": "<client-uuid-1>",
    "clientId": "<client-uuid-1>",
    "onBehalfOfId": "<client-uuid-1>",
    "statusId": "<status-aberto-uuid>",
    "priorityId": "<priority-media-uuid>",
    "categoryId": "<category-uuid>",
    "departmentId": "<dept-uuid>"
  },
  {
    // mesmo título/descrição/status/priority/category
    // mas requesterId/clientId/onBehalfOfId diferentes
    "requesterId": "<client-uuid-2>",
    "clientId": "<client-uuid-2>",
    "onBehalfOfId": "<client-uuid-2>",
    ...
  }
]
```

### Implementação

- Backend: `TicketsService.createBatch()` em `apps/server/src/modules/tickets/tickets.service.ts:87-112`
- Controller: `POST 'batch'` em `apps/server/src/modules/tickets/tickets.controller.ts:42-46`
- Frontend: `ticketsService.createBatch()` em `apps/web/src/services/tickets.ts`
- Frontend: `TicketCreateModal.tsx` reformulado com seção "Solicitantes" dinâmica
- O protocolo de cada ticket gerado em lote usa sufixo aleatório para evitar colisão: `TK-${timestamp}-${random}`

### Regras

- Mínimo 1 solicitante com cliente selecionado
- Se o beneficiário não for selecionado, assume o mesmo cliente solicitante
- Anexo só é vinculado ao primeiro ticket (evita duplicação de arquivo)
- Ativos vinculados são os mesmos para todos os tickets do lote

## 10. Observações

- A reabertura limpa `resolvedAt` e `closedAt` para que o SLA seja recalculado quando o ticket for resolvido novamente
- O `TicketRelation` com `@@unique([ticketId, relatedTicketId])` impede o mesmo par na mesma direção, mas não impede A→B e B→A simultaneamente
- O auto-close por satisfação só fecha se o ticket ainda não estiver "Fechado" (evita sobrescrever fechamento manual)
- O campo `autoCloseHours` no SLA permite que cada nível de serviço tenha seu próprio prazo de fechamento automático
