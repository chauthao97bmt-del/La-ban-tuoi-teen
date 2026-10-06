const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  if (!fs.existsSync('students_8A3.json')) {
    console.log('File not found yet');
    return;
  }
  const students = JSON.parse(fs.readFileSync('students_8A3.json', 'utf8'));
  console.log(`Found ${students.length} students`);
  
  const class8A3 = await prisma.class.findUnique({ where: { name: '8A3' } });
  if (!class8A3) { console.log('Class not found'); return; }

  for (const s of students) {
    let user = await prisma.user.findUnique({ where: { username: s.username } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: s.username,
          passwordHash: bcrypt.hashSync('Demo@123', 10),
          role: 'STUDENT',
          fullName: s.fullName,
        }
      });
      const student = await prisma.student.create({
        data: {
          userId: user.id,
          classId: class8A3.id,
          fullName: s.fullName,
        }
      });
      await prisma.studentProfile.create({ data: { studentId: student.id } });
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { fullName: s.fullName } });
      await prisma.student.updateMany({ where: { userId: user.id }, data: { fullName: s.fullName } });
    }
  }
  console.log('Done 8A3');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
