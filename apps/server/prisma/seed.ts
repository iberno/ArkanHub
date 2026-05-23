import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const start = Date.now();
  const hash = await bcrypt.hash('123456', 10);

  // ── 1. ENTIDADES BASE ──────────────────────────────────────────
  const statusSeed = [
    { name: 'Aberto', color: '#3b82f6' },
    { name: 'Em Andamento', color: '#f59e0b' },
    { name: 'Aguardando', color: '#8b5cf6' },
    { name: 'Resolvido', color: '#10b981' },
    { name: 'Fechado', color: '#6b7280' },
  ];
  for (const s of statusSeed) {
    await prisma.ticketStatus.upsert({ where: { name: s.name }, update: { color: s.color }, create: s });
  }

  const prioritySeed = [
    { name: 'Crítica', level: 1 },
    { name: 'Alta', level: 2 },
    { name: 'Média', level: 3 },
    { name: 'Baixa', level: 4 },
  ];
  for (const p of prioritySeed) {
    await prisma.ticketPriority.upsert({ where: { name: p.name }, update: { level: p.level }, create: p });
  }

  const categorySeed = [
    { name: 'Sistemas' },
    { name: 'Infraestrutura' },
    { name: 'Acessos' },
    { name: 'Projetos' },
    { name: 'Segurança' },
    { name: 'Redes' },
    { name: 'Hardware' },
    { name: 'Software' },
    { name: 'Impressão' },
    { name: 'Telefonia' },
  ];
  const catIds: Record<string, string> = {};
  for (const c of categorySeed) {
    let cat = await prisma.ticketCategory.findFirst({ where: { name: c.name } });
    if (!cat) cat = await prisma.ticketCategory.create({ data: c });
    catIds[c.name] = cat.id;
  }

  // ── 2. ROLES & PERMISSIONS ─────────────────────────────────────
  const roleData = [
    { name: 'admin', desc: 'Acesso total ao sistema' },
    { name: 'supervisor', desc: 'Supervisão e relatórios' },
    { name: 'technician', desc: 'Atendimento de tickets' },
    { name: 'requester', desc: 'Abertura de tickets' },
    { name: 'gestor', desc: 'Gestão de equipes e aprovações' },
    { name: 'gestor_ti', desc: 'Gestão de TI corporativa' },
    { name: 'coord_access', desc: 'Coordenador de acessos' },
    { name: 'coord_projetos', desc: 'Coordenador de projetos' },
  ];
  const roleIds: Record<string, string> = {};
  for (const r of roleData) {
    const created = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.desc },
      create: { name: r.name, description: r.desc },
    });
    roleIds[r.name] = created.id;
  }

  const permData = [
    { key: 'user.create', desc: 'Criar usuários' },
    { key: 'user.edit', desc: 'Editar usuários' },
    { key: 'user.delete', desc: 'Remover usuários' },
    { key: 'ticket.create', desc: 'Criar tickets' },
    { key: 'ticket.assign', desc: 'Atribuir tickets' },
    { key: 'ticket.close', desc: 'Fechar tickets' },
    { key: 'sla.manage', desc: 'Gerenciar SLAs' },
    { key: 'workflow.manage', desc: 'Gerenciar workflows' },
    { key: 'change.approve', desc: 'Aprovar mudanças' },
    { key: 'approval.manage', desc: 'Gerenciar fluxos de aprovação' },
    { key: 'knowledge.manage', desc: 'Gerenciar base de conhecimento' },
    { key: 'report.view', desc: 'Visualizar relatórios' },
    { key: 'access.manage', desc: 'Gerenciar acessos' },
    { key: 'infra.manage', desc: 'Gerenciar infraestrutura' },
    { key: 'project.manage', desc: 'Gerenciar projetos' },
    { key: 'ticket.edit', desc: 'Editar qualquer ticket' },
  ];
  const permIds: Record<string, string> = {};
  for (const p of permData) {
    const created = await prisma.permission.upsert({
      where: { key: p.key },
      update: { description: p.desc },
      create: { key: p.key, description: p.desc },
    });
    permIds[p.key] = created.id;
  }

  // Assign all perms to admin
  for (const key of permData.map(p => p.key)) {
    const exists = await prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId: roleIds['admin'], permissionId: permIds[key] } },
    });
    if (!exists) await prisma.rolePermission.create({ data: { roleId: roleIds['admin'], permissionId: permIds[key] } });
  }

  // Assign perms to other roles
  const rolePermMap: Record<string, string[]> = {
    supervisor: ['ticket.create', 'ticket.assign', 'ticket.close', 'ticket.edit', 'report.view'],
    technician: ['ticket.create', 'ticket.close', 'ticket.edit'],
    requester: ['ticket.create'],
    gestor: ['ticket.create', 'ticket.assign', 'ticket.close', 'ticket.edit', 'report.view', 'approval.manage', 'change.approve'],
    gestor_ti: ['ticket.create', 'ticket.assign', 'ticket.close', 'ticket.edit', 'report.view', 'approval.manage', 'change.approve', 'infra.manage', 'project.manage'],
    coord_access: ['ticket.create', 'ticket.assign', 'ticket.close', 'ticket.edit', 'access.manage'],
    coord_projetos: ['ticket.create', 'ticket.assign', 'ticket.close', 'ticket.edit', 'project.manage'],
  };
  for (const [roleName, perms] of Object.entries(rolePermMap)) {
    for (const key of perms) {
      const exists = await prisma.rolePermission.findUnique({
        where: { roleId_permissionId: { roleId: roleIds[roleName], permissionId: permIds[key] } },
      });
      if (!exists) await prisma.rolePermission.create({ data: { roleId: roleIds[roleName], permissionId: permIds[key] } });
    }
  }

  // ── 3. COMPANIES ──────────────────────────────────────────────
  const companyData = [
    { name: 'ArkanHub - TI Corporativa', document: '00.000.000/0001-01' },
    { name: 'TechSolutions Ltda', document: '11.111.111/0001-11' },
    { name: 'DataCloud S.A.', document: '22.222.222/0001-22' },
    { name: 'NovaTech Indústria', document: '33.333.333/0001-33' },
  ];
  const compIds: Record<string, string> = {};
  for (const c of companyData) {
    const created = await prisma.company.upsert({
      where: { document: c.document },
      update: { name: c.name },
      create: c,
    });
    compIds[c.name] = created.id;
  }

  // ── 4. DEPARTMENTS ────────────────────────────────────────────
  interface DeptDef { name: string; company: string }
  const deptDefs: DeptDef[] = [
    // ArkanHub
    { name: 'Diretoria de TI', company: 'ArkanHub - TI Corporativa' },
    { name: 'Sistemas Corporativos', company: 'ArkanHub - TI Corporativa' },
    { name: 'Infraestrutura', company: 'ArkanHub - TI Corporativa' },
    { name: 'Projetos de TI', company: 'ArkanHub - TI Corporativa' },
    { name: 'Governança e Acessos', company: 'ArkanHub - TI Corporativa' },
    { name: 'Suporte Técnico', company: 'ArkanHub - TI Corporativa' },
    // TechSolutions
    { name: 'Tecnologia', company: 'TechSolutions Ltda' },
    { name: 'Infraestrutura', company: 'TechSolutions Ltda' },
    { name: 'Operações', company: 'TechSolutions Ltda' },
    { name: 'RH', company: 'TechSolutions Ltda' },
    // DataCloud
    { name: 'CloudOps', company: 'DataCloud S.A.' },
    { name: 'DevOps', company: 'DataCloud S.A.' },
    { name: 'Segurança da Informação', company: 'DataCloud S.A.' },
    { name: 'Administrativo', company: 'DataCloud S.A.' },
    // NovaTech
    { name: 'TI Industrial', company: 'NovaTech Indústria' },
    { name: 'Automação', company: 'NovaTech Indústria' },
    { name: 'Manutenção', company: 'NovaTech Indústria' },
    { name: 'Almoxarifado', company: 'NovaTech Indústria' },
  ];
  const deptIds: Record<string, string> = {};
  for (const d of deptDefs) {
    const created = await prisma.department.upsert({
      where: { name_companyId: { name: d.name, companyId: compIds[d.company] } },
      update: { name: d.name },
      create: { name: d.name, companyId: compIds[d.company] },
    });
    deptIds[d.name + '|' + d.company] = created.id;
  }

  // ── 5. USERS ──────────────────────────────────────────────────
  interface UserDef {
    name: string; email: string; role: string;
    company: string; dept: string; isManager?: boolean;
  }
  const userDefs: UserDef[] = [
    // ArkanHub admin (global)
    { name: 'Admin Global', email: 'admin@arkanhub.com', role: 'admin', company: 'ArkanHub - TI Corporativa', dept: 'Diretoria de TI' },
    // ArkanHub gestores
    { name: 'Carlos Menezes', email: 'carlos@arkanhub.com', role: 'gestor_ti', company: 'ArkanHub - TI Corporativa', dept: 'Diretoria de TI', isManager: true },
    { name: 'Ana Oliveira', email: 'ana@arkanhub.com', role: 'supervisor', company: 'ArkanHub - TI Corporativa', dept: 'Sistemas Corporativos', isManager: true },
    { name: 'Roberto Lima', email: 'roberto@arkanhub.com', role: 'supervisor', company: 'ArkanHub - TI Corporativa', dept: 'Infraestrutura', isManager: true },
    { name: 'Juliana Castro', email: 'juliana@arkanhub.com', role: 'coord_projetos', company: 'ArkanHub - TI Corporativa', dept: 'Projetos de TI', isManager: true },
    { name: 'Marcos Santos', email: 'marcos@arkanhub.com', role: 'coord_access', company: 'ArkanHub - TI Corporativa', dept: 'Governança e Acessos', isManager: true },
    // ArkanHub técnicos
    { name: 'Paulo Souza', email: 'paulo@arkanhub.com', role: 'technician', company: 'ArkanHub - TI Corporativa', dept: 'Sistemas Corporativos' },
    { name: 'Fernanda Rocha', email: 'fernanda@arkanhub.com', role: 'technician', company: 'ArkanHub - TI Corporativa', dept: 'Sistemas Corporativos' },
    { name: 'Diego Martins', email: 'diego@arkanhub.com', role: 'technician', company: 'ArkanHub - TI Corporativa', dept: 'Infraestrutura' },
    { name: 'Luciana Torres', email: 'luciana@arkanhub.com', role: 'technician', company: 'ArkanHub - TI Corporativa', dept: 'Infraestrutura' },
    { name: 'Rafael Costa', email: 'rafael@arkanhub.com', role: 'technician', company: 'ArkanHub - TI Corporativa', dept: 'Governança e Acessos' },
    { name: 'Camila Dias', email: 'camila@arkanhub.com', role: 'technician', company: 'ArkanHub - TI Corporativa', dept: 'Suporte Técnico' },
    { name: 'Thiago Alves', email: 'thiago@arkanhub.com', role: 'technician', company: 'ArkanHub - TI Corporativa', dept: 'Suporte Técnico' },
    { name: 'Patrícia Nunes', email: 'patricia@arkanhub.com', role: 'technician', company: 'ArkanHub - TI Corporativa', dept: 'Projetos de TI' },
    { name: 'Gustavo Reis', email: 'gustavo@arkanhub.com', role: 'technician', company: 'ArkanHub - TI Corporativa', dept: 'Projetos de TI' },
    // TechSolutions
    { name: 'Eduardo Faria', email: 'eduardo@techsolutions.com', role: 'gestor_ti', company: 'TechSolutions Ltda', dept: 'Tecnologia', isManager: true },
    { name: 'Amanda Barros', email: 'amanda@techsolutions.com', role: 'technician', company: 'TechSolutions Ltda', dept: 'Tecnologia' },
    { name: 'Bruno Neves', email: 'bruno@techsolutions.com', role: 'technician', company: 'TechSolutions Ltda', dept: 'Infraestrutura' },
    { name: 'Larissa Mendes', email: 'larissa@techsolutions.com', role: 'technician', company: 'TechSolutions Ltda', dept: 'Operações' },
    { name: 'Solicitante TS', email: 'solicitante@techsolutions.com', role: 'requester', company: 'TechSolutions Ltda', dept: 'RH' },
    // DataCloud
    { name: 'Felipe Andrade', email: 'felipe@datacloud.com', role: 'gestor_ti', company: 'DataCloud S.A.', dept: 'CloudOps', isManager: true },
    { name: 'Vanessa Lopes', email: 'vanessa@datacloud.com', role: 'technician', company: 'DataCloud S.A.', dept: 'DevOps' },
    { name: 'Igor Santos', email: 'igor@datacloud.com', role: 'technician', company: 'DataCloud S.A.', dept: 'CloudOps' },
    { name: 'Tatiane Cruz', email: 'tatiane@datacloud.com', role: 'technician', company: 'DataCloud S.A.', dept: 'Segurança da Informação' },
    { name: 'Solicitante DC', email: 'solicitante@datacloud.com', role: 'requester', company: 'DataCloud S.A.', dept: 'Administrativo' },
    // NovaTech
    { name: 'Ricardo Barbosa', email: 'ricardo@novatech.com', role: 'gestor_ti', company: 'NovaTech Indústria', dept: 'TI Industrial', isManager: true },
    { name: 'Simone Vargas', email: 'simone@novatech.com', role: 'technician', company: 'NovaTech Indústria', dept: 'Automação' },
    { name: 'João Pedro', email: 'joao@novatech.com', role: 'technician', company: 'NovaTech Indústria', dept: 'Manutenção' },
    { name: 'Solicitante NT', email: 'solicitante@novatech.com', role: 'requester', company: 'NovaTech Indústria', dept: 'Almoxarifado' },
  ];

  const userIds: Record<string, string> = {};
  for (const u of userDefs) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name },
      create: {
        name: u.name, email: u.email, passwordHash: hash, active: true,
        companyId: compIds[u.company],
        departmentId: deptIds[u.dept + '|' + u.company],
      },
    });
    userIds[u.email] = created.id;
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: created.id, roleId: roleIds[u.role] } },
      update: {},
      create: { userId: created.id, roleId: roleIds[u.role] },
    });
  }

  // Set department managers
  const managerMap: Record<string, string> = {};
  for (const u of userDefs) {
    if (u.isManager) managerMap[u.dept + '|' + u.company] = userIds[u.email];
  }
  for (const [deptKey, managerId] of Object.entries(managerMap)) {
    await prisma.department.update({ where: { id: deptIds[deptKey] }, data: { managerId } });
  }

  // ── 6. CLIENTS ────────────────────────────────────────────────
  interface ClientDef { name: string; email: string; phone: string; company: string; dept: string }
  const clientDefs: ClientDef[] = [
    // ArkanHub
    { name: 'Dr. Alberto Nogueira', email: 'alberto@arkanhub.com', phone: '+55 11 99999-0001', company: 'ArkanHub - TI Corporativa', dept: 'Diretoria de TI' },
    { name: 'Sra. Helena Campos', email: 'helena@techsolutions.com', phone: '+55 11 99999-0002', company: 'TechSolutions Ltda', dept: 'Operações' },
    { name: 'Sr. Otávio Martins', email: 'otavio@datacloud.com', phone: '+55 21 99999-0003', company: 'DataCloud S.A.', dept: 'Administrativo' },
    { name: 'Eng. Mário Sérgio', email: 'mario@novatech.com', phone: '+55 31 99999-0004', company: 'NovaTech Indústria', dept: 'Almoxarifado' },
    // TechSolutions funcionários
    { name: 'Carla Fernandes', email: 'carla.fernandes@techsolutions.com', phone: '+55 11 98888-0001', company: 'TechSolutions Ltda', dept: 'RH' },
    { name: 'Daniel Oliveira', email: 'daniel.oliveira@techsolutions.com', phone: '+55 11 98888-0002', company: 'TechSolutions Ltda', dept: 'Operações' },
    { name: 'Eliane Costa', email: 'eliane.costa@techsolutions.com', phone: '+55 11 98888-0003', company: 'TechSolutions Ltda', dept: 'Operações' },
    { name: 'Gabriel Souza', email: 'gabriel.souza@techsolutions.com', phone: '+55 11 98888-0004', company: 'TechSolutions Ltda', dept: 'Infraestrutura' },
    { name: 'Humberto Dias', email: 'humberto.dias@techsolutions.com', phone: '+55 11 98888-0005', company: 'TechSolutions Ltda', dept: 'Tecnologia' },
    // DataCloud funcionários
    { name: 'Isabela Ramos', email: 'isabela.ramos@datacloud.com', phone: '+55 21 97777-0001', company: 'DataCloud S.A.', dept: 'CloudOps' },
    { name: 'Jorge Almeida', email: 'jorge.almeida@datacloud.com', phone: '+55 21 97777-0002', company: 'DataCloud S.A.', dept: 'DevOps' },
    { name: 'Kelly Nascimento', email: 'kelly.nascimento@datacloud.com', phone: '+55 21 97777-0003', company: 'DataCloud S.A.', dept: 'Administrativo' },
    { name: 'Leonardo Freitas', email: 'leonardo.freitas@datacloud.com', phone: '+55 21 97777-0004', company: 'DataCloud S.A.', dept: 'Segurança da Informação' },
    { name: 'Michele Araújo', email: 'michele.araujo@datacloud.com', phone: '+55 21 97777-0005', company: 'DataCloud S.A.', dept: 'CloudOps' },
    // NovaTech funcionários
    { name: 'Nelson Batista', email: 'nelson.batista@novatech.com', phone: '+55 31 96666-0001', company: 'NovaTech Indústria', dept: 'TI Industrial' },
    { name: 'Olivia Ferreira', email: 'olivia.ferreira@novatech.com', phone: '+55 31 96666-0002', company: 'NovaTech Indústria', dept: 'Automação' },
    { name: 'Pedro Augusto', email: 'pedro.augusto@novatech.com', phone: '+55 31 96666-0003', company: 'NovaTech Indústria', dept: 'Manutenção' },
  ];
  const clientIds: Record<string, string> = {};
  for (const c of clientDefs) {
    let client = await prisma.client.findFirst({ where: { email: c.email } });
    if (!client) {
      client = await prisma.client.create({
        data: {
          name: c.name, email: c.email, phone: c.phone,
          companyId: compIds[c.company], departmentId: deptIds[c.dept + '|' + c.company],
        },
      });
    }
    clientIds[c.email] = client.id;
  }

  // ── 7. SLAs + BUSINESS HOURS ───────────────────────────────────
  const slaSeed = [
    {
      name: 'SLA Corporativo', responseTime: 60, resolutionTime: 480,
      hours: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
        { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
        { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
        { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
        { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
      ],
      rules: [
        { priority: 'Crítica', impact: 'alto' },
        { priority: 'Alta', impact: 'médio' },
        { priority: 'Média', impact: 'médio' },
        { priority: 'Baixa', impact: 'baixo' },
      ],
    },
    {
      name: 'SLA VIP Diretoria', responseTime: 15, resolutionTime: 120,
      hours: [
        { dayOfWeek: 1, startTime: '07:00', endTime: '20:00' },
        { dayOfWeek: 2, startTime: '07:00', endTime: '20:00' },
        { dayOfWeek: 3, startTime: '07:00', endTime: '20:00' },
        { dayOfWeek: 4, startTime: '07:00', endTime: '20:00' },
        { dayOfWeek: 5, startTime: '07:00', endTime: '20:00' },
        { dayOfWeek: 6, startTime: '08:00', endTime: '12:00' },
      ],
      rules: [
        { priority: 'Crítica', impact: 'alto' },
        { priority: 'Alta', impact: 'alto' },
        { priority: 'Média', impact: 'médio' },
        { priority: 'Baixa', impact: 'médio' },
      ],
    },
    {
      name: 'SLA P1 Crítico', responseTime: 15, resolutionTime: 240,
      hours: Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i, startTime: '00:00', endTime: '23:59',
      })),
      rules: [{ priority: 'Crítica', impact: 'alto' }],
    },
    {
      name: 'SLA Acessos', responseTime: 120, resolutionTime: 1440,
      hours: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
        { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
        { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
        { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
        { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
      ],
      rules: [
        { priority: 'Alta', impact: 'médio' },
        { priority: 'Média', impact: 'baixo' },
      ],
    },
    {
      name: 'SLA Projetos', responseTime: 240, resolutionTime: 10080,
      hours: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
        { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
        { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
        { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
        { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
      ],
      rules: [{ priority: 'Baixa', impact: 'baixo' }],
    },
  ];
  const slaIds: Record<string, string> = {};
  for (const s of slaSeed) {
    const { hours, rules, ...slaData } = s;
    const sla = await prisma.sla.upsert({
      where: { name: slaData.name },
      update: { responseTime: slaData.responseTime, resolutionTime: slaData.resolutionTime },
      create: slaData,
    });
    slaIds[slaData.name] = sla.id;

    const existingHours = await prisma.businessHour.findMany({ where: { slaId: sla.id } });
    if (existingHours.length === 0) {
      for (const h of hours) {
        await prisma.businessHour.create({ data: { slaId: sla.id, ...h } });
      }
    }
    const existingRules = await prisma.slaRule.findMany({ where: { slaId: sla.id } });
    if (existingRules.length === 0) {
      for (const r of rules) {
        await prisma.slaRule.create({ data: { slaId: sla.id, ...r } });
      }
    }
  }

  // ── 8. APPROVAL FLOWS ─────────────────────────────────────────
  interface FlowDef {
    name: string; entity: string; steps: { order: number; type: string }[] }
  const flowDefs: FlowDef[] = [
    {
      name: 'Liberação de Acesso', entity: 'ticket',
      steps: [
        { order: 1, type: 'department_manager' },
      ],
    },
    {
      name: 'Aprovação de Projeto', entity: 'ticket',
      steps: [
        { order: 1, type: 'coord_projetos' },
        { order: 2, type: 'department_manager' },
      ],
    },
    {
      name: 'Mudança de Infraestrutura', entity: 'change',
      steps: [
        { order: 1, type: 'department_manager' },
        { order: 2, type: 'gestor_ti' },
      ],
    },
    {
      name: 'Homologação de Acesso Crítico', entity: 'ticket',
      steps: [
        { order: 1, type: 'department_manager' },
        { order: 2, type: 'coord_access' },
        { order: 3, type: 'gestor_ti' },
      ],
    },
  ];
  for (const f of flowDefs) {
    let flow = await prisma.approvalFlow.findFirst({ where: { name: f.name } });
    if (!flow) {
      flow = await prisma.approvalFlow.create({ data: { name: f.name, entityType: f.entity } });
    }
    for (const step of f.steps) {
      const exists = await prisma.approvalStep.findFirst({
        where: { flowId: flow.id, stepOrder: step.order },
      });
      if (!exists) {
        await prisma.approvalStep.create({
          data: { flowId: flow.id, stepOrder: step.order, approverType: step.type },
        });
      }
    }
  }

  // ── 9. WORKFLOW RULES ─────────────────────────────────────────
  interface WorkflowDef {
    name: string; active: boolean;
    conditions: { field: string; operator: string; value: string }[];
    actions: { type: string; payload: string }[];
  }
  const workflowDefs: WorkflowDef[] = [
    {
      name: 'Ticket Crítico → Notificar Gestor', active: true,
      conditions: [{ field: 'priority', operator: 'equals', value: 'Crítica' }],
      actions: [{ type: 'send_notification', payload: '{"message":"Ticket crítico aberto"} ' }],
    },
    {
      name: 'Solicitação de Acesso → Atribuir Acessos', active: true,
      conditions: [{ field: 'category', operator: 'equals', value: 'Acessos' }],
      actions: [{ type: 'assign_user', payload: `{"userId":"${userIds['marcos@arkanhub.com']}"}` }],
    },
    {
      name: 'Problema de Infra → Atribuir Infra', active: true,
      conditions: [{ field: 'category', operator: 'equals', value: 'Infraestrutura' }],
      actions: [{ type: 'assign_user', payload: `{"userId":"${userIds['diego@arkanhub.com']}"}` }],
    },
    {
      name: 'Ticket VIP → Prioridade Alta', active: true,
      conditions: [{ field: 'title', operator: 'contains', value: 'VIP' }],
      actions: [{ type: 'change_priority', payload: '{"priorityId":"Alta"}' }],
    },
  ];
  for (const w of workflowDefs) {
    let rule = await prisma.workflowRule.findFirst({ where: { name: w.name } });
    if (!rule) {
      rule = await prisma.workflowRule.create({ data: { name: w.name, active: w.active } });
    } else {
      rule = await prisma.workflowRule.update({ where: { id: rule.id }, data: { active: w.active } });
    }
    for (const cond of w.conditions) {
      const exists = await prisma.workflowCondition.findFirst({
        where: { workflowId: rule.id, field: cond.field, operator: cond.operator },
      });
      if (!exists) await prisma.workflowCondition.create({ data: { workflowId: rule.id, ...cond } });
    }
    for (const act of w.actions) {
      const exists = await prisma.workflowAction.findFirst({
        where: { workflowId: rule.id, actionType: act.type },
      });
      if (!exists) await prisma.workflowAction.create({ data: { workflowId: rule.id, actionType: act.type, payload: act.payload } });
    }
  }

  // ── 10. KNOWLEDGE ARTICLES ────────────────────────────────────
  interface ArticleDef { title: string; content: string; category: string; author: string }
  const articleDefs: ArticleDef[] = [
    {
      title: 'Como solicitar novo acesso a sistemas',
      content: 'Para solicitar novos acessos, abra um ticket na categoria "Acessos" informando:\n1. Nome completo do colaborador\n2. Sistemas necessários\n3. Justificativa\n4. Aprovação do gestor\n\nO prazo médio para liberação é de 24h úteis.',
      category: 'Acessos', author: 'admin@arkanhub.com',
    },
    {
      title: 'Reset de senha - Procedimento padrão',
      content: 'Para reset de senha:\n1. Verificar identidade do solicitante\n2. Confirmar com o gestor imediato\n3. Reset via AD\n4. Enviar nova senha temporária\n5. Solicitar troca no primeiro acesso',
      category: 'Sistemas', author: 'admin@arkanhub.com',
    },
    {
      title: 'Procedimento de abertura de chamado crítico',
      content: 'Chamados críticos (P1) devem ser abertos por telefone e registrados no sistema em até 15min.\n\nCritérios P1:\n- Sistema indisponível para toda a empresa\n- Perda de dados\n- Falha de segurança ativa',
      category: 'Sistemas', author: 'carlos@arkanhub.com',
    },
    {
      title: 'Como conectar na VPN corporativa',
      content: '1. Solicitar acesso via ticket\n2. Aguardar liberação (até 4h)\n3. Instalar cliente VPN\n4. Usar token do autenticador\n5. Conectar com usuário corporativo',
      category: 'Infraestrutura', author: 'admin@arkanhub.com',
    },
    {
      title: 'Política de segurança para novos colaboradores',
      content: 'Todo novo colaborador deve:\n1. Assinar termo de confidencialidade\n2. Realizar treinamento de segurança\n3. Usar senha forte (12+ caracteres)\n4. Ativar 2FA em todos os sistemas\n5. Não compartilhar credenciais',
      category: 'Segurança', author: 'marcos@arkanhub.com',
    },
    {
      title: 'Catálogo de serviços de TI',
      content: 'A ArkanHub oferece:\n\n**Sistemas:** ERP, CRM, E-mail, AD\n**Infraestrutura:** Servidores, Rede, Backup, VPN\n**Acessos:** Criação/remoção de usuários, permissões\n**Projetos:** Implantação de novos sistemas, migrações\n**Suporte:** Help desk, atendimento presencial\n\nPrazos:\n- P1: 4h\n- P2: 8h\n- P3: 24h\n- P4: 48h',
      category: 'Sistemas', author: 'carlos@arkanhub.com',
    },
  ];
  // Knowledge categories (separate from ticket categories)
  const knowledgeCatIds: Record<string, string> = {};
  const knowledgeCatNames = [...new Set(articleDefs.map(a => a.category))];
  for (const name of knowledgeCatNames) {
    let cat = await prisma.knowledgeCategory.findFirst({ where: { name } });
    if (!cat) cat = await prisma.knowledgeCategory.create({ data: { name } });
    knowledgeCatIds[name] = cat.id;
  }
  for (const a of articleDefs) {
    const exists = await prisma.knowledgeArticle.findFirst({ where: { title: a.title } });
    if (!exists) {
      await prisma.knowledgeArticle.create({
        data: {
          title: a.title, content: a.content,
          categoryId: knowledgeCatIds[a.category],
          authorId: userIds[a.author],
        },
      });
    }
  }

  // ── 11. TICKETS ──────────────────────────────────────────────
  const statusMap = await prisma.ticketStatus.findMany();
  const statusByName: Record<string, string> = {};
  for (const s of statusMap) statusByName[s.name] = s.id;

  const priorityMap = await prisma.ticketPriority.findMany();
  const priorityByName: Record<string, string> = {};
  for (const p of priorityMap) priorityByName[p.name] = p.id;

  interface TicketDef {
    title: string; description: string; status: string; priority: string; category: string;
    requester: string; assignee?: string; client: string; onBehalfOf?: string;
    dept: string; company: string; daysAgo: number;
  }
  const ticketDefs: TicketDef[] = [
    // ── TechSolutions: Acessos ──
    {
      title: 'Solicitação de Acesso - Novo colaborador Daniel Oliveira',
      description: 'Daniel Oliveira foi contratado como Analista de Operações. Solicito criação de:\n- Email corporativo\n- Acesso ao CRM\n- Acesso ao ERP\n- VPN\n- Pasta de rede compartilhada',
      status: 'Aberto', priority: 'Média', category: 'Acessos',
      requester: 'solicitante@techsolutions.com', client: 'daniel.oliveira@techsolutions.com',
      dept: 'Operações', company: 'TechSolutions Ltda', daysAgo: 0,
    },
    {
      title: 'Solicitação de Acesso - Colaborador Eliane Costa (maternidade)',
      description: 'Eliane Costa retornou de licença. Favor reativar:\n- Email\n- Acesso ao sistema financeiro\n- Acesso ao RH\n- Pastas de rede',
      status: 'Em Andamento', priority: 'Média', category: 'Acessos',
      requester: 'solicitante@techsolutions.com', assignee: 'marcos@arkanhub.com',
      client: 'eliane.costa@techsolutions.com',
      dept: 'Operações', company: 'TechSolutions Ltda', daysAgo: 2,
    },
    {
      title: 'VIP - Liberação de acesso ao sistema financeiro para Diretor',
      description: 'Sr. Otávio Martins (Diretor) precisa de acesso emergencial ao sistema financeiro da DataCloud para auditoria. Favor liberar com urgência.',
      status: 'Aberto', priority: 'Crítica', category: 'Acessos',
      requester: 'solicitante@datacloud.com', client: 'otavio@datacloud.com',
      dept: 'Administrativo', company: 'DataCloud S.A.', daysAgo: 0,
    },
    {
      title: 'Remoção de acesso - Colaborador desligado Gabriel Souza',
      description: 'Gabriel Souza foi desligado da TechSolutions. Favor remover todos os acessos:\n- Email\n- Sistemas\n- VPN\n- Pastas de rede\n- Crachá',
      status: 'Resolvido', priority: 'Alta', category: 'Acessos',
      requester: 'solicitante@techsolutions.com', assignee: 'rafael@arkanhub.com',
      client: 'gabriel.souza@techsolutions.com',
      dept: 'Infraestrutura', company: 'TechSolutions Ltda', daysAgo: 5,
    },
    // ── TechSolutions: Infra ──
    {
      title: 'Servidor de arquivos lento - TechSolutions',
      description: 'O servidor de arquivos compartilhados (FS-TS-01) está muito lento desde ontem. Acessos a pastas compartilhadas estão com timeout. Impacta toda a operação.',
      status: 'Em Andamento', priority: 'Alta', category: 'Infraestrutura',
      requester: 'solicitante@techsolutions.com', assignee: 'diego@arkanhub.com',
      client: 'carla.fernandes@techsolutions.com',
      dept: 'Operações', company: 'TechSolutions Ltda', daysAgo: 1,
    },
    {
      title: 'Projetor da sala de reunião não funciona',
      description: 'Projetor da sala 03 não liga. Já trocamos cabo HDMI e fonte. Provavelmente queimou a lâmpada.',
      status: 'Fechado', priority: 'Baixa', category: 'Hardware',
      requester: 'solicitante@techsolutions.com', assignee: 'camila@arkanhub.com',
      client: 'humberto.dias@techsolutions.com',
      dept: 'Tecnologia', company: 'TechSolutions Ltda', daysAgo: 10,
    },
    // ── DataCloud: Cloud / DevOps ──
    {
      title: 'Pipeline de deploy quebrado - DataCloud',
      description: 'Pipeline CI/CD do projeto "Orion" está quebrado após atualização do Docker. Erro: "container process not found" no estágio de build. Impacta deploy em produção.',
      status: 'Aguardando', priority: 'Crítica', category: 'Sistemas',
      requester: 'solicitante@datacloud.com', assignee: 'vanessa@datacloud.com',
      client: 'jorge.almeida@datacloud.com',
      dept: 'DevOps', company: 'DataCloud S.A.', daysAgo: 1,
    },
    {
      title: 'Migração de banco de dados - CloudOps',
      description: 'Solicito migração do banco PostgreSQL versão 13 para 16 do sistema "Nimbus". A migração deve ser agendada para janela de madrugada (00h-06h).',
      status: 'Aberto', priority: 'Média', category: 'Projetos',
      requester: 'solicitante@datacloud.com', client: 'isabela.ramos@datacloud.com',
      dept: 'CloudOps', company: 'DataCloud S.A.', daysAgo: 0,
    },
    {
      title: 'Alerta de capacidade - Disco 90% no servidor DB-01',
      description: 'Servidor DB-01 (DataCloud) está com 92% de uso em /data. Favor aumentar volume ou limpar logs antigos.',
      status: 'Resolvido', priority: 'Alta', category: 'Infraestrutura',
      requester: 'solicitante@datacloud.com', assignee: 'igor@datacloud.com',
      client: 'michele.araujo@datacloud.com',
      dept: 'CloudOps', company: 'DataCloud S.A.', daysAgo: 3,
    },
    // ── DataCloud: Segurança ──
    {
      title: 'Phishing detectado - Campanha de e-mail suspeito',
      description: 'Usuários da DataCloud reportaram e-mails suspeitos com assunto "Fatura em atraso". Link malicioso detectado. Favor bloquear remetente e orientar usuários.',
      status: 'Em Andamento', priority: 'Crítica', category: 'Segurança',
      requester: 'solicitante@datacloud.com', assignee: 'tatiane@datacloud.com',
      client: 'leonardo.freitas@datacloud.com',
      dept: 'Segurança da Informação', company: 'DataCloud S.A.', daysAgo: 0,
    },
    // ── NovaTech: Industrial ──
    {
      title: 'CLP da esteira 3 parou - Linha de produção parada',
      description: 'CLP responsável pela esteira 03 da linha de montagem apresentou falha. Produção parcialmente parada. Previsão de perda: R$ 50k/hora.',
      status: 'Em Andamento', priority: 'Crítica', category: 'Infraestrutura',
      requester: 'solicitante@novatech.com', assignee: 'diego@arkanhub.com',
      client: 'nelson.batista@novatech.com',
      dept: 'TI Industrial', company: 'NovaTech Indústria', daysAgo: 0,
    },
    {
      title: 'Atualização de firmware - Robôs de solda',
      description: 'Solicito agendamento para atualização de firmware dos 3 robôs de solda (modelo ABB IRB 6700). Necessário parada programada de 4h.',
      status: 'Aguardando', priority: 'Média', category: 'Projetos',
      requester: 'solicitante@novatech.com', client: 'olivia.ferreira@novatech.com',
      onBehalfOf: 'pedro.augusto@novatech.com',
      dept: 'Automação', company: 'NovaTech Indústria', daysAgo: 4,
    },
    {
      title: 'Notebook do almoxarifado com tela quebrada',
      description: 'Colaborador Pedro Augusto quebrou a tela do notebook Dell Latitude 5430. Favor substituir ou providenciar reparo.',
      status: 'Aberto', priority: 'Baixa', category: 'Hardware',
      requester: 'solicitante@novatech.com',
      client: 'pedro.augusto@novatech.com',
      dept: 'Almoxarifado', company: 'NovaTech Indústria', daysAgo: 0,
    },
    {
      title: 'Impressora do almoxarifado sem toner',
      description: 'Impressora HP LaserJet P2035 sem toner. Já solicitamos compra mas está demorando. Precisamos de toner urgente pois vamos imprimir notas fiscais.',
      status: 'Fechado', priority: 'Baixa', category: 'Impressão',
      requester: 'solicitante@novatech.com', assignee: 'camila@arkanhub.com',
      client: 'mario.sergio@novatech.com',
      dept: 'Almoxarifado', company: 'NovaTech Indústria', daysAgo: 8,
    },
    // ── ArkanHub: Projetos ──
    {
      title: 'PROJETO: Implantação de novo sistema de RH',
      description: 'Projeto de implantação do sistema de RH unificado para todas as empresas do grupo.\n\nEscopo:\n- Migração de dados legados\n- Configuração de permissões\n- Treinamento de usuários\n- Suporte pós-implantação (30 dias)\n\nPrazo estimado: 3 meses.',
      status: 'Em Andamento', priority: 'Média', category: 'Projetos',
      requester: 'carlos@arkanhub.com', assignee: 'juliana@arkanhub.com',
      client: 'helena@techsolutions.com',
      dept: 'Projetos de TI', company: 'ArkanHub - TI Corporativa', daysAgo: 15,
    },
    {
      title: 'PROJETO: Migração de e-mails para Cloud',
      description: 'Migrar todos os mailboxes das 3 empresas do Exchange on-premises para Microsoft 365.\n\nEmpresas:\n- TechSolutions: 50 caixas\n- DataCloud: 120 caixas\n- NovaTech: 30 caixas\n\nTotal: ~200 caixas. Prazo: 60 dias.',
      status: 'Aguardando', priority: 'Alta', category: 'Projetos',
      requester: 'carlos@arkanhub.com', assignee: 'gustavo@arkanhub.com',
      client: 'alberto.nogueira@arkanhub.com',
      dept: 'Projetos de TI', company: 'ArkanHub - TI Corporativa', daysAgo: 7,
    },
    // ── ArkanHub: Sistemas ──
    {
      title: 'ERP Financeiro lento no fechamento mensal',
      description: 'Sistema ERP está extremamente lento durante o fechamento mensal (últimos 5 dias úteis do mês). Relatórios que levavam 2min estão levando 30min+.\n\nImpacta diretamente o fechamento contábil.',
      status: 'Em Andamento', priority: 'Alta', category: 'Sistemas',
      requester: 'carlos@arkanhub.com', assignee: 'paulo@arkanhub.com',
      client: 'alberto.nogueira@arkanhub.com',
      dept: 'Sistemas Corporativos', company: 'ArkanHub - TI Corporativa', daysAgo: 3,
    },
    {
      title: 'Bug no módulo de relatórios do CRM',
      description: 'Relatório de vendas comparativo (mês atual vs mês anterior) está exibindo valores incorretos. Diferença de aproximadamente 15% para mais.',
      status: 'Aberto', priority: 'Média', category: 'Sistemas',
      requester: 'solicitante@techsolutions.com', assignee: 'fernanda@arkanhub.com',
      client: 'humberto.dias@techsolutions.com',
      dept: 'Tecnologia', company: 'TechSolutions Ltda', daysAgo: 0,
    },
    // ── NovaTech: Redes ──
    {
      title: 'Queda de rede no galpão 2 - NovaTech',
      description: 'Switch do galpão 2 parou de responder. Equipe do galpão está sem acesso aos sistemas e internet. Já verificamos energia, switch parece morto.',
      status: 'Em Andamento', priority: 'Crítica', category: 'Redes',
      requester: 'solicitante@novatech.com', assignee: 'thiago@arkanhub.com',
      client: 'nelson.batista@novatech.com',
      dept: 'Manutenção', company: 'NovaTech Indústria', daysAgo: 0,
    },
    // ── DataCloud: Adicionais ──
    {
      title: 'Criação de novo ambiente de staging',
      description: 'Precisamos de um novo ambiente de staging para testes da versão 3.0 da plataforma Orion.\n\nRequisitos:\n- 4 vCPUs\n- 16GB RAM\n- 200GB SSD\n- Acesso SSH para equipe DevOps',
      status: 'Aberto', priority: 'Média', category: 'Infraestrutura',
      requester: 'solicitante@datacloud.com', assignee: 'felipe@datacloud.com',
      client: 'vanessa@datacloud.com',
      dept: 'DevOps', company: 'DataCloud S.A.', daysAgo: 0,
    },
    {
      title: 'Auditoria de acessos - Trimestral',
      description: 'Solicito auditoria de acessos dos sistemas críticos da DataCloud para o relatório trimestral de compliance.\n\nSistemas a auditar:\n- Banco de dados financeiro\n- Sistema de pagamentos\n- Painel administrativo',
      status: 'Aberto', priority: 'Média', category: 'Segurança',
      requester: 'solicitante@datacloud.com',
      client: 'kelly.nascimento@datacloud.com',
      dept: 'Administrativo', company: 'DataCloud S.A.', daysAgo: 0,
    },
  ];

  // get a default "Aberto" status ID for reference
  const statusAberto = statusByName['Aberto'];
  const depsTech = 'TechSolutions Ltda';
  const depsData = 'DataCloud S.A.';
  const depsNova = 'NovaTech Indústria';
  const depsArkan = 'ArkanHub - TI Corporativa';

  const ticketSlaMap: Record<string, string> = {};
  ticketSlaMap[depsTech] = slaIds['SLA Corporativo'];
  ticketSlaMap[depsData] = slaIds['SLA Corporativo'];
  ticketSlaMap[depsNova] = slaIds['SLA Corporativo'];
  ticketSlaMap[depsArkan] = slaIds['SLA Corporativo'];

  let ticketCount = 0;
  for (const t of ticketDefs) {
    const openedAt = new Date(Date.now() - t.daysAgo * 86400000);
    const slaId = ticketSlaMap[t.company];
    await prisma.ticket.create({
      data: {
        protocol: `TK-${(1000 + ticketCount).toString(36).toUpperCase()}`,
        title: t.title,
        description: t.description,
        requesterId: userIds[t.requester],
        assignedTo: t.assignee ? userIds[t.assignee] : null,
        clientId: clientIds[t.client],
        onBehalfOfId: t.onBehalfOf ? clientIds[t.onBehalfOf] : null,
        departmentId: deptIds[t.dept + '|' + t.company],
        statusId: statusByName[t.status] ?? statusAberto,
        priorityId: priorityByName[t.priority],
        categoryId: catIds[t.category],
        slaId,
        openedAt,
        resolvedAt: t.status === 'Resolvido' || t.status === 'Fechado'
          ? new Date(openedAt.getTime() + 3600000) : null,
        closedAt: t.status === 'Fechado'
          ? new Date(openedAt.getTime() + 7200000) : null,
      },
    });
    ticketCount++;
  }

  // Add tech solutions email for the client that has onBehalfOf
  try {
    const tsCompany = await prisma.company.findFirst({ where: { document: '11.111.111/0001-11' } });
    if (tsCompany) {
      const emailDomain = 'techsolutions.com';
      const existingDept = await prisma.department.findFirst({
        where: { name: 'RH', companyId: tsCompany.id },
      });
      if (!existingDept) {
        await prisma.department.create({
          data: { name: 'RH', companyId: tsCompany.id },
        });
      }
    }
  } catch { /* ignore */ }

  // ── NOTIFICATIONS ────────────────────────────────────────────
  const notifyUsers = ['carlos@arkanhub.com', 'marcos@arkanhub.com', 'felipe@datacloud.com', 'ricardo@novatech.com'];
  for (const email of notifyUsers) {
    await prisma.notification.create({
      data: {
        userId: userIds[email],
        title: 'Bem-vindo ao ArkanHub ITSM',
        body: 'Sua conta foi configurada. Você pode começar a gerenciar tickets, acessos e aprovações.',
        type: 'system',
        read: false,
      },
    });
  }

  // ── SUMMARY ──────────────────────────────────────────────────
  console.log(`\n✅ Seed concluído em ${((Date.now() - start) / 1000).toFixed(1)}s`);
  console.log(`🏢 ${companyData.length} empresas`);
  console.log(`🏛  ${deptDefs.length} departamentos`);
  console.log(`👤 ${userDefs.length} usuários`);
  console.log(`🧑 ${clientDefs.length} clientes`);
  console.log(`🎫 ${ticketCount} tickets`);
  console.log(`📋 ${slaSeed.length} SLAs`);
  console.log(`📝 ${flowDefs.length} fluxos de aprovação`);
  console.log(`⚙️  ${workflowDefs.length} regras de workflow`);
  console.log(`📖 ${articleDefs.length} artigos na base de conhecimento`);
  console.log(`\n🔑 Credenciais padrão: admin@arkanhub.com / 123456`);
  console.log(`🔑 Senha de todos os usuários: 123456`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
