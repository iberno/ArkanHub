import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@alka.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@alka.com',
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
      update: {},
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
      update: {},
      create: priority,
    });
  }

  console.log('Seed concluído com sucesso!');
  console.log(`Admin: admin@alka.com / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
