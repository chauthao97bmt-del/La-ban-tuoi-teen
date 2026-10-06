const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
  
  const students = await prisma.student.findMany({
    where: { fullName: { startsWith: 'Học sinh ' } }
  });
  
  const ids = students.map(s => s.id);
  const userIds = students.map(s => s.userId);
  
  await prisma.studentProfile.deleteMany({where: {studentId: {in: ids}}});
  await prisma.student.deleteMany({where: {id: {in: ids}}});
  await prisma.user.deleteMany({where: {id: {in: userIds}}});
  
  console.log('Deleted ' + ids.length + ' students!');
}

main().finally(() => prisma.$disconnect());
