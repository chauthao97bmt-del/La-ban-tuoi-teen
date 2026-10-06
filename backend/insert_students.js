const fs = require('fs');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = JSON.parse(fs.readFileSync('students.json', 'utf8'));
  let count = 0;
  for(const s of students) {
    const username = s.username;
    const fullName = s.fullName;
    let user = await prisma.user.findUnique({ where: { username } });
    if(!user) {
      user = await prisma.user.create({
        data: {
          username,
          role: 'STUDENT',
          passwordHash: bcrypt.hashSync('Demo@123', 10)
        }
      });
    }
    const classStr = username.substring(0, 3);
    const classRecord = await prisma.class.findFirst({ where: { name: classStr } });
    if(classRecord) {
      let student = await prisma.student.findUnique({ where: { userId: user.id } });
      if(!student) {
        student = await prisma.student.create({
          data: {
            userId: user.id,
            classId: classRecord.id,
            fullName
          }
        });
        await prisma.studentProfile.create({ data: { studentId: student.id } });
      } else {
        await prisma.student.update({
          where: { id: student.id },
          data: { fullName }
        });
      }
      count++;
    }
  }
  console.log('Processed ' + count + ' students');
}

main().finally(()=>prisma.$disconnect());
