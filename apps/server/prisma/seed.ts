import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@arkanhub.com' },
    update: { name: 'Administrador' },
    create: {
      name: 'Administrador',
      email: 'admin@arkanhub.com',
      passwordHash: adminPass,
    },
  });

  const statuses = [
    { name: 'Aberto', color: '#3b82f6' },
    { name: 'Em Andamento', color: '#f59e0b' },
    { name: 'Aguardando', color: '#8b5cf6' },
    { name: 'Resolvido', color: '#10b981' },
    { name: 'Fechado', color: '#6b7280' },
  ];

  for (const status of statuses) {
    await prisma.ticketStatus.upsert({
      where: { name: status.name },
      update: { color: status.color },
      create: status,
    });
  }

  const priorities = [
    { name: 'Crítica', level: 1 },
    { name: 'Alta', level: 2 },
    { name: 'Média', level: 3 },
    { name: 'Baixa', level: 4 },
  ];

  for (const priority of priorities) {
    await prisma.ticketPriority.upsert({
      where: { name: priority.name },
      update: { level: priority.level },
      create: priority,
    });
  }

  const rolesData = [
    { name: 'admin', description: 'Acesso total ao sistema' },
    { name: 'supervisor', description: 'Supervisão e relatórios' },
    { name: 'technician', description: 'Atendimento de tickets' },
    { name: 'requester', description: 'Abertura de tickets' },
  ];

  const permissionsData = [
    { key: 'user.create', description: 'Criar usuários' },
    { key: 'user.edit', description: 'Editar usuários' },
    { key: 'user.delete', description: 'Remover usuários' },
    { key: 'ticket.create', description: 'Criar tickets' },
    { key: 'ticket.assign', description: 'Atribuir tickets' },
    { key: 'ticket.close', description: 'Fechar tickets' },
    { key: 'sla.manage', description: 'Gerenciar SLAs' },
    { key: 'workflow.manage', description: 'Gerenciar workflows' },
    { key: 'change.approve', description: 'Aprovar mudanças' },
  ];

  const createdRoles: Record<string, string> = {};
  for (const role of rolesData) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    createdRoles[role.name] = created.id;
  }

  const createdPermissions: Record<string, string> = {};
  for (const perm of permissionsData) {
    const created = await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description },
      create: perm,
    });
    createdPermissions[perm.key] = created.id;
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: createdRoles['admin'] } },
    update: {},
    create: { userId: admin.id, roleId: createdRoles['admin'] },
  });

  const adminPermKeys = permissionsData.map((p) => p.key);
  for (const key of adminPermKeys) {
    const exists = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: createdRoles['admin'],
          permissionId: createdPermissions[key],
        },
      },
    });
    if (!exists) {
      await prisma.rolePermission.create({
        data: {
          roleId: createdRoles['admin'],
          permissionId: createdPermissions[key],
        },
      });
    }
  }

  console.log('Seed concluído com sucesso!');
  console.log(`Admin: admin@arkanhub.com / admin123`);
  console.log(`Roles: ${rolesData.map((r) => r.name).join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
