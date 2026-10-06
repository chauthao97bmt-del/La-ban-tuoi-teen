const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const u = await p.user.findUnique({ where: { username: 'nguyenthi.chauthao' } });
  if (!u) { console.log('NOT FOUND'); return; }
  await p.user.update({ where: { id: u.id }, data: { role: 'ADMIN' } });
  console.log('OK - upgraded to ADMIN:', u.id, u.username);
}

main().catch(console.error).finally(() => p.$disconnect());
