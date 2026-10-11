const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function test() {
  const username = '9A709';
  const user = await prisma.user.findUnique({ where: { username } });
  console.log('user:', user ? user.username : 'null');
  if (!user) return;
  const valid = await bcrypt.compare('Demo@123', user.passwordHash);
  console.log('valid:', valid);
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: { class: { include: { teacher: true } }, profile: true }
  });
  console.log('student:', student ? student.fullName : 'null');
  console.log('class:', student && student.class ? student.class.name : 'null');
  console.log('teacher:', student && student.class ? student.class.teacher : 'null');
}

test()
  .catch(e => console.error('CAUGHT:', e))
  .finally(() => prisma.$disconnect());
