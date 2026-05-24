# Manual do Usuário — ArkanHub

## 1. Sobre o Sistema

ArkanHub é uma plataforma corporativa de gerenciamento de tickets ITSM (Information Technology Service Management), baseada nas melhores práticas do ITIL v4. O sistema oferece:

- Gestão de Incidentes e Requisições de Serviço
- Gestão de Problemas e Mudanças
- Aprovações Multietapas
- SLA Inteligente com cálculo automático
- Base de Conhecimento
- Automação de Fluxos de Trabalho
- Gestão de Projetos (PMI)
- BI e Relatórios Gerenciais
- Classificação por IA
- Chatbot para atendimento

---

## 2. Acesso e Autenticação

### Login

Acesse o sistema pelo navegador. A tela de login solicita:

- **E-mail** — seu endereço de e-mail corporativo
- **Senha** — sua senha de acesso

### Primeiro Acesso

Usuários são cadastrados pelo administrador. Na criação, uma senha provisória é definida. Recomenda-se alterar a senha no perfil após o primeiro login.

### Recuperação de Acesso

Em caso de esquecimento da senha, contate o administrador do sistema para redefinição.

---

## 3. Dashboard

O dashboard apresenta uma visão geral do ambiente com indicadores em tempo real:

- **Tickets por status** — gráfico de distribuição (Aberto, Em Andamento, Aguardando, Resolvido, Fechado)
- **Tickets por prioridade** — distribuição por nível de criticidade
- **Tickets mensais** — evolução ao longo dos meses
- **SLAs** — métricas de resposta e resolução
- **Satisfação** — média das avaliações dos clientes

Os dados variam conforme o perfil do usuário logado.

---

## 4. Tickets (Atendimento)

### 4.1 Lista de Tickets

A página principal de tickets exibe uma tabela com filtros:

- **Busca** — por protocolo, título ou descrição
- **Status** — badges clicáveis para selecionar múltiplos status (Aberto, Em Andamento, Aguardando, Resolvido, Fechado)
- **Modo de exibição** — badges "Todos", "Meus tickets", "Não atribuídos"
- **Paginação** — 15 tickets por página

Cada linha da tabela mostra: protocolo, título, status (com cor), prioridade, solicitante, responsável edata de abertura.

### 4.2 Criar Ticket (Individual)

Clique em **"Novo Ticket"** na lista de tickets. Preencha:

| Campo | Descrição |
|-------|-----------|
| Título | Descrição resumida do problema/solicitação |
| Descrição | Detalhamento do problema |
| Status | "Aberto" por padrão |
| Prioridade | "Média" por padrão |
| Categoria | Categoria pai + subcategoria (se houver) |
| Departamento | Departamento responsável |
| Cliente solicitante | Cliente que está solicitando |
| Beneficiário | Quem se beneficiará (padrão = solicitante) |
| Ativos vinculados | Ativos relacionados ao ticket |
| Anexo | Arquivo complementar |

Após preencher, clique em **"Criar Ticket"**.

### 4.3 Criar Múltiplos Tickets (Batch)

Quando um incidente recorrente afeta várias pessoas (ex: sistema fora do ar, vários clientes ligam), é possível criar tickets em lote:

1. Clique em **"Novo Ticket"**
2. Preencha os **campos base** (título, descrição, categoria, prioridade, status, departamento, ativos, anexo) — serão compartilhados entre todos os tickets
3. Na seção **"Solicitantes"**, adicione quantas linhas forem necessárias clicando em **"+ Adicionar solicitante"**
4. Para cada linha, selecione o **Cliente solicitante** e o **Beneficiário** (padrão = mesmo cliente)
5. O botão de envio mostra **"Criar N Tickets"** conforme a quantidade
6. Clique para criar todos os tickets de uma só vez

### 4.4 Detalhe do Ticket

Clique em qualquer ticket na lista para abrir o modal de detalhes. O modal é dividido em:

**Coluna principal (esquerda):**
- **Reatribuição** — alterar responsável e departamento
- **Comentários** — adicionar comentários (internos ou públicos)
- **Anexos** — upload e download de arquivos
- **Avaliação** — pesquisa de satisfação (disponível quando o ticket está Resolvido ou Fechado)
- **Aprovações** — aprovar ou rejeitar solicitações de aprovação

**Sidebar (direita):**
- **Informações** — status, prioridade, categoria, solicitante, responsável, cliente, beneficiário, departamento
- **Ações** conforme o status do ticket (ver seções abaixo)

### 4.5 Avaliar Satisfação

Quando um ticket é resolvido, o solicitante pode avaliar o atendimento:

1. Acesse o detalhe do ticket
2. Na seção **"Avaliação"**, dê uma nota de 1 a 5 estrelas
3. Opcionalmente, deixe um comentário
4. Clique em **"Enviar avaliação"**

**Importante:** Se a nota for **3 ou superior** (aprovado), o ticket é **automaticamente fechado** (status "Fechado"). Notas 1 ou 2 mantêm o ticket como "Resolvido".

### 4.6 Reabrir Ticket

Um ticket com status **"Resolvido"** pode ser reaberto:

1. Acesse o detalhe do ticket
2. Na sidebar, clique em **"Reabrir ticket"**
3. O status volta para **"Em Andamento"**
4. Os campos `resolvido em` e `fechado em` são limpos

**Regra:** Tickets com status **"Fechado"** não podem ser reabertos.

### 4.7 Ticket Relacionado (Fechado)

Se um ticket já está **"Fechado"** e o problema persiste:

1. Acesse o detalhe do ticket fechado
2. Na sidebar, clique em **"Criar novo ticket relacionado"**
3. Você será redirecionado para o formulário de novo ticket
4. Um alerta azul informa que o novo ticket será vinculado ao anterior
5. Ao criar, o novo ticket fica linkado como **"substituto"** do antigo
6. O histórico do ticket anterior pode ser consultado através da relação

### 4.8 Tickets Fechados

A página **"Tickets Fechados"** (menu lateral) lista apenas tickets com status "Resolvido" ou "Fechado", facilitando o acompanhamento de atendimentos concluídos.

Funcionalidades: busca por protocolo/título, paginação, modal de detalhes.

---

## 5. Projetos

### 5.1 Lista de Projetos

A página de projetos exibe cards em grid com:

- Nome e descrição
- Status (Draft, Planned, In Progress, Completed, Cancelled)
- Prioridade
- Gerente responsável
- Data de início
- Quantidade de tickets vinculados

### 5.2 Criar Projeto

Clique em **"Novo Projeto"** para abrir o modal de criação:

| Campo | Descrição |
|-------|-----------|
| Nome | Nome do projeto |
| Descrição | Objetivo e escopo |
| Gerente | Responsável pelo projeto |
| Prioridade | Baixa, Média, Alta ou Crítica |
| Data de início | Início planejado |
| Previsão de término | Data alvo para conclusão |

### 5.3 Detalhe do Projeto

Clique em um projeto para acessar o detalhe com 4 abas:

#### Visão Geral
- **Charter** — documento de abertura do projeto
- **Status** — botões para transitar entre Draft → Planned → In Progress → Completed / Cancelled
- **Marcos** — checklist de milestones com data (adicione clicando em "+ Adicionar")
- **Fases** — fases do projeto (ex: Iniciação, Planejamento, Execução...)
- **Dados Financeiros** — orçamento estimado e real

#### Tickets
Lista todos os tickets vinculados ao projeto em formato de tabela. Use o botão **"Novo ticket no projeto"** para criar tickets já associados ao projeto.

#### Riscos
Gerencie os riscos do projeto com:
- Descrição do risco
- Probabilidade (Baixo / Médio / Alto)
- Impacto (Baixo / Médio / Alto)
- Mitigação (plano de ação)
- Responsável (owner)
- Status (Aberto / Mitigado / Fechado)

#### Equipe
Gerencie os stakeholders do projeto:
- Adicione membros com seus papéis (Sponsor, Gerente, Membro, Stakeholder, Cliente)
- Remova membros quando necessário

### 5.4 Converter Ticket em Projeto

Para transformar um ticket em um projeto:

1. Acesse o detalhe do ticket
2. Na sidebar, clique em **"Converter em Projeto"**
3. Digite o **nome do projeto**
4. Clique em **"Converter"**
5. O projeto é criado com charter contendo os dados do ticket origem
6. Você é redirecionado para a página do novo projeto
7. O ticket fica vinculado ao projeto

---

## 6. Ativos (CMDB)

Gerencie o inventário de ativos de TI:

- **Lista** — tabela com tag, nome, marca, modelo, número de série, status, categoria
- **Cadastro** — formulário com categoria, marca, modelo, número de série, status, garantia, valor
- **Edição** — duplo clique para editar células
- **Vinculação** — ativos podem ser vinculados a tickets durante a criação

### Categorias de Ativo

Os ativos são organizados em categorias hierárquicas (ex: Hardware → Servidores / Estações / Notebooks, Software → Sistemas / Licenças).

---

## 7. Clientes

Cadastro de clientes (pessoas físicas ou jurídicas) que podem ser solicitantes ou beneficiários de tickets.

- **Lista** — tabela com nome, e-mail, telefone, empresa
- **Cadastro** — nome, e-mail, telefone, empresa vinculada
- **Edição** — duplo clique para editar

---

## 8. Categorias

Gerencie a hierarquia de categorias utilizadas em tickets e ativos. A estrutura é unificada (mesma categoria serve para ambos).

- Grid responsivo (1 a 5 colunas conforme a tela)
- Cards com nome, quantidade de tickets e ativos vinculados
- Categorias pai expandem para mostrar subcategorias
- Criação e edição por duplo clique

---

## 9. Administração

### 9.1 Usuários

Gerencie os usuários do sistema:

- **Lista** — todos os usuários cadastrados
- **Cadastro** — nome, e-mail, senha, cargo, departamento, empresa, foto
- **Edição** — duplo clique para editar
- **Papéis (Roles)** — atribua um ou mais papéis ao usuário, definindo suas permissões
- **Ativar/Desativar** — usuários inativos não podem acessar o sistema

### 9.2 Empresas

Cadastro de empresas (multi-tenancy):

- Nome, documento (CNPJ)
- Departamentos vinculados
- Clientes vinculados

### 9.3 Departamentos

Departamentos são vinculados a empresas e possuem um **gerente** que pode aprovar tickets.

- Nome, empresa, gerente
- Unique composto: nome + empresa (nomes podem repetir entre empresas diferentes)

### 9.4 SLAs (Service Level Agreements)

Configure os Acordos de Nível de Serviço:

| Campo | Descrição |
|-------|-----------|
| Nome | Identificação do SLA |
| Tempo de resposta | Horas para primeira resposta |
| Tempo de resolução | Horas para resolução |
| Auto-close (horas) | Tempo após "Resolvido" para fechamento automático (padrão: 72h) |
| Regras | Associação a categorias, prioridades e departamentos |
| Horário comercial | Dias e horários para cálculo do SLA |

### 9.5 Workflows

Automação de fluxos de trabalho baseada em eventos:

- **Condições** — quando o workflow deve disparar (ex: ticket criado com prioridade "Crítica")
- **Ações** — o que fazer (ex: atribuir a um usuário, notificar, mudar status)
- **Execução** — dispara automaticamente quando as condições são atendidas

---

## 10. Processos

### 10.1 Aprovações

Fluxos de aprovação multietapas:

- **Fluxos de aprovação** — configure etapas com aprovadores
- **Solicitações** — tickets enviados para aprovação
- **Aprovar/Rejeitar** — aprovadores podem aprovar ou rejeitar com comentários
- **Histórico** — registro de todas as aprovações

### 10.2 Base de Conhecimento

Artigos de documentação com versionamento:

- **Categorias** — organize artigos por assunto
- **Artigos** — título, conteúdo, anexos
- **Versões** — histórico de alterações com restauração
- **Busca** — encontre artigos rapidamente

### 10.3 Problemas

Gestão de problemas (análise de causa raiz):

- **Cadastro** — título, descrição, causa raiz, solução de contorno (workaround)
- **Tickets vinculados** — problemas podem ter múltiplos tickets associados
- **Erros conhecidos** — registro de erros com solução documentada

### 10.4 Mudanças (Changes)

Gestão de mudanças com aprovação via CAB:

- **RFC (Request for Change)** — solicitação de mudança
- **Categorias** — Normal, Emergencial, Padrão
- **Aprovação CAB** — membros do Change Advisory Board aprovam
- **Tickets vinculados** — mudanças podem ter tickets associados

---

## 11. Relatórios (BI)

Dashboard analítico com métricas gerenciais:

- **Visão Geral** — tickets por período, SLA, satisfação
- **Distribuição** — tickets por status, prioridade, categoria, departamento
- **Tendências** — evolução temporal (7, 15, 30, 90 dias)
- **Mensal** — fechamento mensal
- **Desempenho por Departamento** — comparativo entre departamentos

Indicadores:
- **MTTR** — Mean Time to Resolve (tempo médio de resolução)
- **MTTA** — Mean Time to Acknowledge (tempo médio de resposta)
- **SLA** — percentual de cumprimento
- **Satisfação** — nota média das avaliações

---

## 12. Perfil e Notificações

### Perfil

Acesse seu perfil para:

- Visualizar seus dados cadastrais
- Alterar foto (avatar)

### Notificações

O sino no cabeçalho exibe notificações não lidas:

- Atribuição de tickets
- Mudanças de status
- Solicitações de aprovação
- Atualizações em tickets que você acompanha

Clique em uma notificação para ser direcionado ao conteúdo relacionado.

---

## 13. Atalhos e Boas Práticas

### Duplo Clique para Editar

Em todas as páginas de dados (usuários, empresas, departamentos, SLAs, categorias), utilize **duplo clique** sobre o valor para editar diretamente na tabela — sem botões de edição.

### Badges de Filtro

Na lista de tickets, utilize os **badges** clicáveis para filtrar:
- **Status** — clique em um ou mais status para filtrar
- **Modo** — "Todos", "Meus tickets" ou "Não atribuídos"
- **"Limpar"** — remove todos os filtros ativos

### Chatbot

O chatbot flutuante (canto inferior direito) permite:
- Criar tickets via conversa
- Consultar tickets existentes
- Pesquisar na base de conhecimento

---

## 14. Papéis e Permissões

| Papel | Descrição |
|-------|-----------|
| **admin** | Acesso total ao sistema |
| **supervisor** | Gerencia tickets, visualiza relatórios |
| **technician** | Atende tickets |
| **requester** | Apenas cria tickets |
| **gestor** | Aprova mudanças, gerencia tickets |
| **gestor_ti** | Gerencia TI, infraestrutura e projetos |
| **coord_access** | Gerencia acessos |
| **coord_projetos** | Gerencia projetos |

Cada papel possui um conjunto de permissões que define o que o usuário pode ver e fazer no sistema.

---

## 15. Glossário

| Termo | Definição |
|-------|-----------|
| **Ticket** | Registro de um incidente ou requisição de serviço |
| **Protocolo** | Identificador único do ticket (formato TK-XXXX) |
| **SLA** | Acordo de Nível de Serviço (Service Level Agreement) |
| **MTTR** | Tempo médio para resolução |
| **MTTA** | Tempo médio para resposta |
| **RFC** | Request for Change (solicitação de mudança) |
| **CAB** | Change Advisory Board (comitê de aprovação de mudanças) |
| **WBS** | Work Breakdown Structure (estrutura analítica do projeto) |
| **Charter** | Documento de abertura do projeto |
| **Stakeholder** | Parte interessada no projeto |
| **Milestone** | Marco importante do projeto |
| **CMDB** | Configuration Management Database (banco de ativos) |
