import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding asset categories...');

  const categories = [
    { name: 'Computadores' },
    { name: 'Notebooks' },
    { name: 'Monitores' },
    { name: 'Impressoras' },
    { name: 'Redes & Servidores' },
    { name: 'Telefonia' },
    { name: 'Mobiliário' },
    { name: 'Periféricos' },
  ];

  const catMap = new Map<string, string>();

  for (const cat of categories) {
    const existing = await prisma.category.findFirst({ where: { name: cat.name } });
    if (existing) {
      catMap.set(cat.name, existing.id);
    } else {
      const created = await prisma.category.create({ data: cat });
      catMap.set(cat.name, created.id);
    }
  }

  console.log('Seeding assets...');

  const companies = await prisma.company.findMany();
  const departments = await prisma.department.findMany();
  const users = await prisma.user.findMany({ where: { active: true } });

  const companyId = companies[0]?.id;
  const departmentId = departments[0]?.id;
  const userId = users[0]?.id;

  const assets = [
    { tag: 'PC-001', name: 'Desktop Dell Optiplex 3090', category: 'Computadores', brand: 'Dell', serial: 'SN-DELL-001' },
    { tag: 'PC-002', name: 'Desktop HP EliteDesk 800', category: 'Computadores', brand: 'HP', serial: 'SN-HP-001' },
    { tag: 'PC-003', name: 'Desktop Lenovo ThinkCentre', category: 'Computadores', brand: 'Lenovo', serial: 'SN-LEN-001' },
    { tag: 'NB-001', name: 'Notebook Dell Latitude 5420', category: 'Notebooks', brand: 'Dell', model: 'Latitude 5420', serial: 'SN-DELL-NB-001' },
    { tag: 'NB-002', name: 'Notebook Lenovo ThinkPad T14', category: 'Notebooks', brand: 'Lenovo', model: 'ThinkPad T14', serial: 'SN-LEN-NB-001' },
    { tag: 'NB-003', name: 'MacBook Pro 14"', category: 'Notebooks', brand: 'Apple', model: 'MacBook Pro 14"', serial: 'SN-APP-NB-001' },
    { tag: 'MON-001', name: 'Monitor Dell 27"', category: 'Monitores', brand: 'Dell', model: 'P2723DE', serial: 'SN-DELL-MON-001' },
    { tag: 'MON-002', name: 'Monitor LG 24"', category: 'Monitores', brand: 'LG', model: '24MK430H', serial: 'SN-LG-MON-001' },
    { tag: 'IMP-001', name: 'Impressora HP LaserJet Pro', category: 'Impressoras', brand: 'HP', model: 'M404dn', serial: 'SN-HP-IMP-001' },
    { tag: 'IMP-002', name: 'Impressora Epson L3250', category: 'Impressoras', brand: 'Epson', model: 'L3250', serial: 'SN-EPS-IMP-001' },
    { tag: 'SW-001', name: 'Switch Cisco SG350-28', category: 'Redes & Servidores', brand: 'Cisco', serial: 'SN-CIS-SW-001' },
    { tag: 'FW-001', name: 'Firewall Fortinet 60F', category: 'Redes & Servidores', brand: 'Fortinet', model: '60F', serial: 'SN-FORT-FW-001' },
    { tag: 'AP-001', name: 'Access Point Unifi U6-Pro', category: 'Redes & Servidores', brand: 'Ubiquiti', model: 'U6-Pro', serial: 'SN-UBI-AP-001' },
    { tag: 'TEL-001', name: 'Ramal VoIP Cisco 7841', category: 'Telefonia', brand: 'Cisco', model: '7841', serial: 'SN-CIS-TEL-001' },
    { tag: 'TEL-002', name: 'Ramal VoIP Polycom VVX 411', category: 'Telefonia', brand: 'Polycom', model: 'VVX 411', serial: 'SN-POL-TEL-001' },
    { tag: 'MOB-001', name: 'Mesa Escritório 140x70', category: 'Mobiliário', brand: 'Flexform' },
    { tag: 'MOB-002', name: 'Cadeira Ergonômica', category: 'Mobiliário', brand: 'Flexform', model: 'President' },
    { tag: 'PER-001', name: 'Teclado Mecânico Dell', category: 'Periféricos', brand: 'Dell', serial: 'SN-DELL-KB-001' },
    { tag: 'PER-002', name: 'Mouse Logitech MX Master 3', category: 'Periféricos', brand: 'Logitech', model: 'MX Master 3S', serial: 'SN-LOG-MS-001' },
    { tag: 'PER-003', name: 'Webcam Logitech C920', category: 'Periféricos', brand: 'Logitech', model: 'C920', serial: 'SN-LOG-WC-001' },
  ];

  for (const a of assets) {
    const existing = await prisma.asset.findUnique({ where: { tag: a.tag } });
    if (!existing) {
      const catId = catMap.get(a.category);
      if (!catId) continue;
      await prisma.asset.create({
        data: {
          tag: a.tag,
          name: a.name,
          categoryId: catId,
          brand: a.brand,
          model: a.model,
          serialNumber: a.serial,
          status: 'active',
          companyId,
          departmentId,
          assignedTo: userId,
        },
      });
    }
  }

  console.log('Asset seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
