const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.user.count()
  .then(c => console.log('POOLER SUCCESS! Student count:', c))
  .catch(e => console.error('POOLER FAILED:', e.message))
  .finally(() => prisma.$disconnect());
