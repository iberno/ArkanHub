import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

function weightedPick<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

function randomDate(daysAgoMin: number, daysAgoMax: number): Date {
  const daysAgo = randomInt(daysAgoMin, daysAgoMax);
  const date = new Date(Date.now() - daysAgo * 86400000);
  date.setHours(randomInt(7, 18), randomInt(0, 59), randomInt(0, 59), 0);
  return date;
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3600000);
}

// ── Title & Description Templates ────────────────────────

interface TicketTemplate {
  category: string;
  title: string;
  desc: string;
}

const TICKET_TEMPLATES: TicketTemplate[] = [
  // Sistemas
  { category: 'Sistemas', title: 'ERP lento no módulo financeiro', desc: 'O módulo financeiro do ERP está extremamente lento desde ontem à tarde. Relatórios que levavam segundos agora levam mais de 5 minutos para gerar.' },
  { category: 'Sistemas', title: 'Falha no login do sistema de vendas', desc: 'Usuários reportam erro 500 ao tentar acessar o sistema de vendas. A tela de login não responde após inserir as credenciais.' },
  { category: 'Sistemas', title: 'Atualização do sistema de RH solicitada', desc: 'Solicito atualização da versão do sistema de RH para a 4.2. Conforme comunicado do fornecedor, a versão atual 4.0 sairá de suporte em 30 dias.' },
  { category: 'Sistemas', title: 'Erro ao emitir nota fiscal eletrônica', desc: 'Ao tentar emitir NF-e, o sistema retorna "Falha de comunicação com SEFAZ". Já verificamos certificado digital e está válido.' },
  { category: 'Sistemas', title: 'Base de dados do CRM corrompida', desc: 'Após queda de energia no datacenter, a base do CRM apresenta inconsistências. Alguns registros de oportunidades foram perdidos.' },
  { category: 'Sistemas', title: 'Integração entre sistemas parou de funcionar', desc: 'A fila de integração entre o ERP e o WMS parou de processar às 14h. Cerca de 300 pedidos aguardam sincronização.' },
  { category: 'Sistemas', title: 'Relatório gerencial não exporta para Excel', desc: 'O botão de exportar relatório gerencial para Excel não funciona. Nenhum erro é exibido, mas o arquivo não é gerado.' },
  { category: 'Sistemas', title: 'Sistema de compras com lentidão', desc: 'O sistema de compras está muito lento no horário de pico (9h-11h). As cotações demoram até 2 minutos para abrir.' },

  // Infraestrutura
  { category: 'Infraestrutura', title: 'Servidor de arquivos indisponível', desc: 'O servidor de arquivos \\\\fileserver\\dados está inacessível. Usuários do setor administrativo não conseguem acessar documentos compartilhados.' },
  { category: 'Infraestrutura', title: 'Capacidade do storage atingindo limite', desc: 'O storage principal está com 92% de ocupação. Projetamos atingir 100% em aproximadamente 15 dias se nenhuma ação for tomada.' },
  { category: 'Infraestrutura', title: 'Backup do banco de dados falhou', desc: 'O backup noturno do banco de dados principal falhou com erro "insufficient disk space". Verificar espaço e reagendar.' },
  { category: 'Infraestrutura', title: 'Switch do rack 3 apresenta perda de pacotes', desc: 'O switch Cisco do rack 3 do datacenter está apresentando perda de pacotes intermitente (~5%). Impacta a comunicação entre servidores.' },
  { category: 'Infraestrutura', title: 'Certificado SSL expirando', desc: 'O certificado SSL do portal corporativo expira em 5 dias. Necessário renovar urgentemente para evitar indisponibilidade do site.' },
  { category: 'Infraestrutura', title: 'Servidor de aplicação com alto consumo de CPU', desc: 'O servidor de aplicação app02 está com CPU a 95% constante desde as 8h. Aplicações respondendo lentamente.' },
  { category: 'Infraestrutura', title: 'Cluster VMware com falha em nó', desc: 'O nó ESXi-03 do cluster de produção entrou em estado de desconexão. VMs foram movidas automaticamente para outros nós.' },

  // Acessos
  { category: 'Acessos', title: 'Criação de conta para novo colaborador', desc: 'Solicito criação de conta de rede, e-mail e acesso aos sistemas CRM e ERP para o novo colaborador João Silva, que inicia na segunda-feira.' },
  { category: 'Acessos', title: 'Desbloqueio de conta bloqueada', desc: 'A conta do usuário Marcos Oliveira foi bloqueada após 3 tentativas de senha incorretas. Solicito desbloqueio imediato.' },
  { category: 'Acessos', title: 'Remoção de acesso de ex-colaborador', desc: 'O funcionário Pedro Alves foi desligado hoje. Favor remover todos os acessos: e-mail, VPN, sistemas, diretórios compartilhados.' },
  { category: 'Acessos', title: 'Solicitação de acesso à VPN', desc: 'Preciso de acesso VPN para trabalhar remotamente durante viagem na próxima semana. Acesso necessário para os sistemas internos.' },
  { category: 'Acessos', title: 'Permissão especial no sistema financeiro', desc: 'Solicito permissão de aprovação de pagamentos até R$ 50.000 no sistema financeiro para o usuário Carlos Mendes, conforme autorização da diretoria.' },

  // Projetos
  { category: 'Projetos', title: 'Migração de servidores para nova versão', desc: 'Conforme cronograma do projeto de atualização, os servidores app01 a app04 precisam ser migrados para a versão 2024.2 do sistema operacional.' },
  { category: 'Projetos', title: 'Implementação de novo módulo de BI', desc: 'Iniciar a implementação do módulo de Business Intelligence contratado. Escopo inclui dashboard executivo e relatórios gerenciais.' },
  { category: 'Projetos', title: 'Atualização de firewall corporativo', desc: 'Substituição dos firewalls corporativos prevista para o próximo mês. Necessário planejamento de janela de manutenção e testes.' },
  { category: 'Projetos', title: 'Implantaçao de sistema de chamados internos', desc: 'Projeto de implantação do sistema de service desk para atender os colaboradores. Fase 1: rollout para TI, Fase 2: demais departamentos.' },

  // Segurança
  { category: 'Segurança', title: 'Phishing reportado por usuários', desc: 'Diversos usuários reportaram e-mails suspeitos com assunto "Fatura em aberto - Liquidação imediata". Conteúdo parece ser phishing direcionado.' },
  { category: 'Segurança', title: 'Varredura de vulnerabilidades agendada', desc: 'Executar varredura de vulnerabilidades nos segmentos 10.0.0.0/16 conforme política de segurança mensal. Relatório deve ser enviado ao CISO.' },
  { category: 'Segurança', title: 'Acesso suspeito identificado no log', desc: 'Logs do SIEM indicam múltiplas tentativas de acesso ao servidor db01 vindas de IP externo não autorizado. Investigar possível tentativa de invasão.' },
  { category: 'Segurança', title: 'Antivírus com definições desatualizadas', desc: 'Cerca de 50 estações de trabalho estão com definições de antivírus desatualizadas há mais de 7 dias. Necessário forçar atualização.' },

  // Redes
  { category: 'Redes', title: 'Queda de link de internet', desc: 'O link principal de internet caiu às 10h30. O link de backup ativou automaticamente, mas a capacidade é reduzida. Fornecedor já foi acionado.' },
  { category: 'Redes', title: 'Ponto de rede sem conectividade', desc: 'A tomada de rede da sala 305 não está funcionando. Testamos o cabo e a estação de trabalho, o problema persiste na tomada.' },
  { category: 'Redes', title: 'Wi-Fi corporativo instável', desc: 'Usuários reportam quedas frequentes no Wi-Fi corporativo no bloco B, principalmente entre 13h e 15h. Possível interferência ou saturação.' },
  { category: 'Redes', title: 'Configuração de VLAN para novo setor', desc: 'Solicito configuração de nova VLAN para o setor de Pesquisa e Desenvolvimento. Faixa de IP sugerida: 192.168.50.0/24.' },

  // Hardware
  { category: 'Hardware', title: 'Notebook com tela danificada', desc: 'Notebook Dell Latitude do usuário sofreu queda e a tela está trincada. Necessário substituição ou reparo. Dados estão intactos.' },
  { category: 'Hardware', title: 'Estação de trabalho não liga', desc: 'Desktop HP da recepção não liga. Não há sinal de energia, fonte possivelmente queimada. Substituição temporária necessária.' },
  { category: 'Hardware', title: 'Impressora com erro de fusor', desc: 'Impressora laserjet do setor contábil apresenta erro "fusor com baixa vida útil". Peça já foi solicitada mas não chegou.' },
  { category: 'Hardware', title: 'Teclado com defeito', desc: 'Teclado do posto de trabalho 12 apresenta teclas que não respondem (Enter, Backspace e setas). Troca simples.' },
  { category: 'Hardware', title: 'Monitor com pixel morto', desc: 'Monitor Dell de 27" do designer apresenta pixel morto no centro da tela. Dentro do prazo de garantia.' },
  { category: 'Hardware', title: 'Bateria de notebook viciada', desc: 'Notebook Lenovo ThinkPad não mantém carga por mais de 30 minutos desconectado da tomada. Bateria com vida útil esgotada.' },

  // Software
  { category: 'Software', title: 'Microsoft Office com erro de ativação', desc: 'Ao abrir o Office 365, aparece mensagem "Produto sem licença". A assinatura está ativa, mas a ativação local foi perdida após atualização.' },
  { category: 'Software', title: 'Adobe Creative Cloud não abre', desc: 'O Adobe Creative Cloud apresenta erro de licença após atualização do sistema operacional. Tentamos re-instalar mas o erro persiste.' },
  { category: 'Software', title: 'Atualização do Java necessária', desc: 'Sistema interno requer Java 17, mas as estações ainda estão com Java 11. Necessário atualização em lote para evitar falhas.' },
  { category: 'Software', title: 'Ferramenta de backup não abre', desc: 'A interface de gerenciamento do Veeam Backup não abre no navegador. Serviços estão rodando mas a UI não responde.' },
  { category: 'Software', title: 'TeamViewer com uso comercial detectado', desc: 'TeamViewer bloqueou a conexão alegando uso comercial. Necessário migrar para alternativa ou adquirir licença comercial.' },

  // Impressão
  { category: 'Impressão', title: 'Impressora sem papel mas bandeja cheia', desc: 'A impressora do andar 4 informa "sem papel" mesmo com a bandeja cheia. Sensor com defeito.' },
  { category: 'Impressão', title: 'Driver de impressora não encontrado', desc: 'Ao tentar instalar a impressora no notebook novo do diretor, o driver não é encontrado. É uma impressora Kyocera FS-4020DN.' },
  { category: 'Impressão', title: 'Fila de impressão travada', desc: 'Fila de impressão do setor jurídico está travada com 15 documentos pendentes. Limpar fila e reiniciar serviço de spooler.' },
  { category: 'Impressão', title: 'Impressora imprimindo linhas', desc: 'Impressora térmica do almoxarifado está imprimindo com linhas brancas horizontais. Cabeçote precisa de limpeza ou substituição.' },

  // Telefonia
  { category: 'Telefonia', title: 'Ramal sem tom de discagem', desc: 'O ramal 215 do setor de vendas está mudo. Não há tom de discagem nem chamada entrando. Cabo verificado, problema persiste.' },
  { category: 'Telefonia', title: 'Configuração de novo ramal', desc: 'Solicito configuração de ramal para o novo colaborador do setor financeiro, sala 412. Aparelho já está instalado, falta liberação.' },
  { category: 'Telefonia', title: 'URA com mensagem incorreta', desc: 'A mensagem da URA (Unidade de Resposta Audível) está desatualizada. O horário de funcionamento informado não corresponde ao atual.' },
  { category: 'Telefonia', title: 'Chamadas externas com ruído', desc: 'As chamadas externas estão com ruído excessivo. Possível problema no tronco SIP ou na qualidade do link de internet.' },
  { category: 'Telefonia', title: 'Correio de voz não funciona', desc: 'O correio de voz do ramal 105 não grava mensagens. Sistema informa "caixa postal cheia" mesmo após limpeza.' },
];

// ── Comment templates ────────────────────────────────────

const COMMENTS = [
  'Verificando o problema, retorno em breve.',
  'Consegui reproduzir o erro. Estou analisando a causa.',
  'Providenciando a correção, aguarde.',
  'Correção aplicada com sucesso. Favor validar.',
  'Solicito mais informações para prosseguir com o atendimento.',
  'Teste realizado e ambiente normalizado.',
  'Aguardando retorno do usuário para validar a solução.',
  'Encaminhado para o setor responsável.',
  'Chamado em andamento, equipe técnica já está alocada.',
  'Peça solicitada ao fornecedor. Previsão de chegada em 48h.',
  'Atualização realizada com sucesso.',
  'Usuário orientado sobre a solução alternativa.',
  'Procedimento realizado conforme solicitado.',
  'Necessário agendamento para acesso presencial à estação.',
  'Serviço restabelecido. Monitorando estabilidade.',
];

// ── Satisfaction comments ────────────────────────────────

const SATISFACTION_COMMENTS = [
  'Atendimento rápido e eficiente. Muito obrigado!',
  'Problema resolvido, mas demorou um pouco mais do que o esperado.',
  'Excelente atendimento, técnico muito prestativo.',
  'Resolveu o problema, mas poderia ter se comunicado melhor.',
  'Atendimento dentro do prazo, satisfeito com o resultado.',
  'Poderia ter sido mais ágil, mas no final deu certo.',
  'Serviço perfeito, resolvido em minutos!',
  'Bom atendimento, mas precisei ligar várias vezes para ter retorno.',
  'Atendimento nota 10, resolvemos tudo rapidamente.',
  'Solução definitiva, não tive mais o problema. Obrigado!',
  'Técnico muito educado e competente. Recomendo.',
  'Demorou para resolver, mas a qualidade do serviço foi boa.',
];

// ── Main ─────────────────────────────────────────────────

async function main() {
  // Cleanup: delete all fake tickets (those with sequential TK-XXXX protocols)
  console.log('Limpando tickets gerados anteriormente...');
  const fakeTickets = await prisma.ticket.findMany({
    where: { protocol: { startsWith: 'TK-' } },
    select: { id: true },
  });
  const fakeIds = fakeTickets.map(t => t.id);
  if (fakeIds.length > 0) {
    await prisma.ticketSatisfaction.deleteMany({ where: { ticketId: { in: fakeIds } } });
    await prisma.ticketHistory.deleteMany({ where: { ticketId: { in: fakeIds } } });
    await prisma.ticketAttachment.deleteMany({ where: { ticketId: { in: fakeIds } } });
    await prisma.ticketComment.deleteMany({ where: { ticketId: { in: fakeIds } } });
    await prisma.workflowExecution.deleteMany({ where: { ticketId: { in: fakeIds } } });
    await prisma.approvalHistory.deleteMany({ where: { request: { ticketId: { in: fakeIds } } } });
    await prisma.approvalRequest.deleteMany({ where: { ticketId: { in: fakeIds } } });
    await prisma.ticket.deleteMany({ where: { id: { in: fakeIds } } });
    console.log(`  ${fakeIds.length} tickets removidos`);
  }

  console.log('Buscando dados existentes...');

  const companies = await prisma.company.findMany();
  const departments = await prisma.department.findMany({ include: { company: true } });
  const users = await prisma.user.findMany({ include: { company: true, roles: { include: { role: true } } } });
  const clients = await prisma.client.findMany();
  const statuses = await prisma.ticketStatus.findMany();
  const priorities = await prisma.ticketPriority.findMany();
  const categories = await prisma.category.findMany();
  const slas = await prisma.sla.findMany();

  // Build lookup maps
  const statusByName = Object.fromEntries(statuses.map(s => [s.name, s.id]));
  const priorityByName = Object.fromEntries(priorities.map(p => [p.name, p.id]));
  const catByName = Object.fromEntries(categories.map(c => [c.name, c.id]));
  const slaByName = Object.fromEntries(slas.map(s => [s.name, s.id]));
  const companyByName = Object.fromEntries(companies.map(c => [c.name, c.id]));

  const deptMap: Record<string, string> = {};
  for (const d of departments) {
    deptMap[d.name + '|' + d.company.name] = d.id;
  }

  // Classify users
  const arkanhubId = companyByName['ArkanHub - TI Corporativa'];
  const arkanhubUsers = users.filter(u => u.companyId === arkanhubId);

  // Assignees: ArkanHub users with role technician, supervisor, gestor_ti, coord_projetos, coord_access
  const assignableRoles = new Set(['technician', 'supervisor', 'gestor_ti', 'coord_projetos', 'coord_access', 'admin']);
  const assignees = arkanhubUsers.filter(u =>
    u.roles.some(r => assignableRoles.has(r.role.name))
  );

  // Requesters: non-ArkanHub users + some ArkanHub admins/managers
  const nonArkanhub = users.filter(u => u.companyId !== arkanhubId);
  const arkanhubRequesters = arkanhubUsers.filter(u =>
    u.roles.some(r => r.role.name === 'admin' || r.role.name === 'gestor_ti')
  );
  const requesters = [...nonArkanhub, ...arkanhubRequesters];

  console.log(`  Empresas: ${companies.length}`);
  console.log(`  Departamentos: ${departments.length}`);
  console.log(`  Usuários: ${users.length} (ArkanHub: ${arkanhubUsers.length}, elegíveis p/ atendimento: ${assignees.length})`);
  console.log(`  Clientes: ${clients.length}`);
  console.log(`  Status: ${statuses.length}`);
  console.log(`  Prioridades: ${priorities.length}`);
  console.log(`  Categorias: ${categories.length}`);
  console.log(`  SLAs: ${slas.length}`);

  // Count remaining existing tickets (from original seed) to determine protocol counter
  const existingCount = await prisma.ticket.count();
  const baseCounter = existingCount;

  console.log(`  Tickets do seed original: ${existingCount}, base counter: ${baseCounter}`);

  // ── Generate Tickets ─────────────────────────────────

  const TOTAL = 1200;
  const MONTHS_BACK = 5;
  const now = Date.now();

  // Build month boundaries (each ~30 days)
  const monthRanges: { minDays: number; maxDays: number }[] = [];
  for (let m = 0; m < MONTHS_BACK; m++) {
    const maxDays = m * 30 + 25;
    const minDays = m * 30 + 5;
    monthRanges.push({ minDays, maxDays });
  }

  // Status distribution per month (older → more resolved)
  const statusDistByMonth: { value: string; weight: number }[][] = [
    // Month -5 (oldest)
    [
      { value: 'Resolvido', weight: 55 },
      { value: 'Fechado', weight: 35 },
      { value: 'Em Andamento', weight: 5 },
      { value: 'Aberto', weight: 3 },
      { value: 'Aguardando', weight: 2 },
    ],
    // Month -4
    [
      { value: 'Resolvido', weight: 50 },
      { value: 'Fechado', weight: 30 },
      { value: 'Em Andamento', weight: 10 },
      { value: 'Aberto', weight: 5 },
      { value: 'Aguardando', weight: 5 },
    ],
    // Month -3
    [
      { value: 'Resolvido', weight: 40 },
      { value: 'Fechado', weight: 20 },
      { value: 'Em Andamento', weight: 20 },
      { value: 'Aberto', weight: 12 },
      { value: 'Aguardando', weight: 8 },
    ],
    // Month -2
    [
      { value: 'Resolvido', weight: 25 },
      { value: 'Fechado', weight: 10 },
      { value: 'Em Andamento', weight: 35 },
      { value: 'Aberto', weight: 20 },
      { value: 'Aguardando', weight: 10 },
    ],
    // Month -1 (most recent)
    [
      { value: 'Resolvido', weight: 15 },
      { value: 'Fechado', weight: 5 },
      { value: 'Em Andamento', weight: 40 },
      { value: 'Aberto', weight: 30 },
      { value: 'Aguardando', weight: 10 },
    ],
  ];

  // Priority distribution (overall)
  const priorityDist = [
    { value: 'Crítica', weight: 10 },
    { value: 'Alta', weight: 25 },
    { value: 'Média', weight: 45 },
    { value: 'Baixa', weight: 20 },
  ];

  // SLA by department mapping
  const slaCorp = slaByName['SLA Corporativo'];
  const slaVip = slaByName['SLA VIP Diretoria'];
  const slaP1 = slaByName['SLA P1 Crítico'];
  const slaAcessos = slaByName['SLA Acessos'];
  const slaProjetos = slaByName['SLA Projetos'];

  // ── Batch insertion ──────────────────────────────────

  const BATCH_SIZE = 100;
  const ticketInserts: Prisma.TicketCreateManyInput[] = [];
  const satisfactionData: { ticketIndex: number; rating: number; comment?: string }[] = [];
  const historyData: { ticketIndex: number; userId: string; oldValue: string; newValue: string; createdAt: Date }[] = [];
  const commentData: { ticketIndex: number; userId: string; comment: string; internal: boolean; createdAt: Date }[] = [];

  // Pre-aggregate department → category mapping
  const arkanhubDeptCategories: Record<string, string[]> = {
    'Diretoria de TI': ['Sistemas', 'Infraestrutura', 'Acessos', 'Segurança'],
    'Sistemas Corporativos': ['Sistemas', 'Software'],
    'Infraestrutura': ['Infraestrutura', 'Redes', 'Hardware'],
    'Projetos de TI': ['Projetos'],
    'Governança e Acessos': ['Acessos', 'Segurança'],
    'Suporte Técnico': ['Hardware', 'Software', 'Impressão', 'Telefonia', 'Redes'],
  };

  console.log('\nGerando 1200 tickets...\n');

  for (let i = 0; i < TOTAL; i++) {
    // Pick month
    const monthIdx = i < 240 ? 0 : i < 480 ? 1 : i < 720 ? 2 : i < 960 ? 3 : 4;
    const range = monthRanges[monthIdx];
    const openedAt = randomDate(range.maxDays, range.minDays);

    const statusName = weightedPick(statusDistByMonth[monthIdx]);
    const isResolved = statusName === 'Resolvido';
    const isClosed = statusName === 'Fechado';

    // Pick priority
    const priorityName = weightedPick(priorityDist);
    const priorityId = priorityByName[priorityName];

    // Pick requester
    const requester = pick(requesters);

    // Pick template
    const template = pick(TICKET_TEMPLATES);
    const categoryId = catByName[template.category];

    // Pick department based on category
    const deptCandidates = Object.entries(arkanhubDeptCategories)
      .filter(([, cats]) => cats.includes(template.category))
      .map(([deptName]) => deptName);
    const deptNameForTicket = pick(deptCandidates);
    const deptFullName = deptNameForTicket + '|ArkanHub - TI Corporativa';
    const departmentId = deptMap[deptFullName];

    // Pick assignee from matching department, else random
    const assigneePool = assignees.filter(a => {
      const aDept = departments.find(d => d.id === a.departmentId);
      return aDept && deptNameForTicket === aDept.name;
    });
    const assignee = (assigneePool.length > 0 ? pick(assigneePool) : pick(assignees)).id;

    // Pick client (onBehalfOf) ~45% of the time
    const client = Math.random() < 0.45 && clients.length > 0 ? pick(clients) : null;

    // Pick SLA
    let slaId = slaCorp;
    if (priorityName === 'Crítica') slaId = slaP1;
    else if (categoryId === catByName['Acessos']) slaId = slaAcessos;
    else if (categoryId === catByName['Projetos']) slaId = slaProjetos;
    else if (requester.email === 'admin@arkanhub.com' || requester.email === 'carlos@arkanhub.com') slaId = slaVip;

    // Compute resolvedAt / closedAt
    let resolvedAt: Date | null = null;
    let closedAt: Date | null = null;
    if (isResolved) {
      resolvedAt = addHours(openedAt, randomInt(1, priorityName === 'Crítica' ? 8 : priorityName === 'Alta' ? 24 : 72));
    } else if (isClosed) {
      resolvedAt = addHours(openedAt, randomInt(1, 48));
      closedAt = addHours(resolvedAt, randomInt(4, 48));
    }

    // Slight chance of reassignment history (~22%)
    let hadReassignment = false;
    if (Math.random() < 0.22) {
      const oldAssignee = pick(assignees.filter(a => a.id !== assignee));
      if (oldAssignee) {
        historyData.push({
          ticketIndex: i,
          userId: oldAssignee.id,
          oldValue: oldAssignee.id,
          newValue: assignee,
          createdAt: addHours(openedAt, randomInt(1, 12)),
        });
        hadReassignment = true;
      }
    }

    ticketInserts.push({
      protocol: `TK-${(1000 + baseCounter + i).toString(36).toUpperCase()}`,
      title: template.title,
      description: template.desc,
      requesterId: requester.id,
      assignedTo: assignee,
      clientId: client?.id ?? null,
      onBehalfOfId: null,
      departmentId,
      statusId: statusByName[statusName],
      priorityId,
      categoryId,
      slaId,
      openedAt,
      resolvedAt,
      closedAt,
    });

    // Satisfaction for ~35% of resolved/closed tickets
    if ((isResolved || isClosed) && Math.random() < 0.35) {
      const rating = weightedPick([
        { value: 5, weight: 35 },
        { value: 4, weight: 30 },
        { value: 3, weight: 20 },
        { value: 2, weight: 10 },
        { value: 1, weight: 5 },
      ]);
      satisfactionData.push({
        ticketIndex: i,
        rating,
        comment: Math.random() < 0.6 ? pick(SATISFACTION_COMMENTS) : undefined,
      });
    }

    // Comments for ~55% of tickets (1-3 comments)
    if (Math.random() < 0.55) {
      const numComments = randomInt(1, 3);
      for (let c = 0; c < numComments; c++) {
        commentData.push({
          ticketIndex: i,
          userId: c === 0 ? requester.id : assignee,
          comment: pick(COMMENTS),
          internal: c > 0 && Math.random() < 0.3,
          createdAt: addHours(openedAt, randomInt(1, 48) * (c + 1)),
        });
      }
    }

    // Progress
    if ((i + 1) % 200 === 0) {
      console.log(`  Preparados ${i + 1}/${TOTAL} tickets...`);
    }
  }

  // ── Insert in batches ─────────────────────────────────

  console.log('\nInserindo tickets...');
  for (let i = 0; i < ticketInserts.length; i += BATCH_SIZE) {
    const batch = ticketInserts.slice(i, i + BATCH_SIZE);
    await prisma.ticket.createMany({ data: batch });
    console.log(`  ${Math.min(i + BATCH_SIZE, ticketInserts.length)}/${ticketInserts.length} tickets inseridos`);
  }

  // Fetch inserted tickets by protocol to get IDs
  const protocols = ticketInserts.map(t => t.protocol);
  const insertedTickets = await prisma.ticket.findMany({
    where: { protocol: { in: protocols } },
    orderBy: { createdAt: 'asc' },
  });

  const ticketByProtocol = Object.fromEntries(insertedTickets.map(t => [t.protocol, t]));

  // Insert satisfaction
  if (satisfactionData.length > 0) {
    console.log(`\nInserindo ${satisfactionData.length} avaliações de satisfação...`);
    const satBatch: Prisma.TicketSatisfactionCreateManyInput[] = [];
    for (const s of satisfactionData) {
      const ticket = ticketInserts[s.ticketIndex];
      const dbTicket = ticketByProtocol[ticket.protocol];
      if (dbTicket) {
        satBatch.push({
          ticketId: dbTicket.id,
          rating: s.rating,
          comment: s.comment ?? null,
        });
      }
    }
    await prisma.ticketSatisfaction.createMany({ data: satBatch });
    console.log(`  ${satBatch.length} avaliações inseridas`);
  }

  // Insert history
  if (historyData.length > 0) {
    console.log(`\nInserindo ${historyData.length} registros de reatribuição...`);
    const histBatch: Prisma.TicketHistoryCreateManyInput[] = [];
    for (const h of historyData) {
      const ticket = ticketInserts[h.ticketIndex];
      const dbTicket = ticketByProtocol[ticket.protocol];
      if (dbTicket) {
        histBatch.push({
          ticketId: dbTicket.id,
          userId: h.userId,
          field: 'assignedTo',
          oldValue: h.oldValue,
          newValue: h.newValue,
          createdAt: h.createdAt,
        });
      }
    }
    await prisma.ticketHistory.createMany({ data: histBatch });
    console.log(`  ${histBatch.length} históricos inseridos`);
  }

  // Insert comments
  if (commentData.length > 0) {
    console.log(`\nInserindo ${commentData.length} comentários...`);
    const commentBatch: Prisma.TicketCommentCreateManyInput[] = [];
    for (const c of commentData) {
      const ticket = ticketInserts[c.ticketIndex];
      const dbTicket = ticketByProtocol[ticket.protocol];
      if (dbTicket) {
        commentBatch.push({
          ticketId: dbTicket.id,
          userId: c.userId,
          comment: c.comment,
          internal: c.internal,
          createdAt: c.createdAt,
        });
      }
    }
    await prisma.ticketComment.createMany({ data: commentBatch });
    console.log(`  ${commentBatch.length} comentários inseridos`);
  }

  // ── Summary ───────────────────────────────────────────

  const totalTickets = await prisma.ticket.count();
  const statusCounts = await prisma.ticket.groupBy({
    by: ['statusId'],
    _count: true,
  });
  const totalSatisfaction = await prisma.ticketSatisfaction.count();
  const avgSatisfaction = await prisma.ticketSatisfaction.aggregate({ _avg: { rating: true } });

  console.log('\n══════════════ RESUMO ══════════════');
  console.log(`Total de tickets: ${totalTickets}`);
  for (const sc of statusCounts) {
    const st = statuses.find(s => s.id === sc.statusId);
    console.log(`  ${st?.name ?? 'Desconhecido'}: ${sc._count}`);
  }
  console.log(`Avaliações de satisfação: ${totalSatisfaction}`);
  console.log(`Média de satisfação: ${avgSatisfaction._avg.rating?.toFixed(2) ?? 'N/A'}`);
  console.log('═══════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
