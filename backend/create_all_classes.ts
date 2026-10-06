import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CLASSES = [
  '8A1', '8A2', '8A3', '8A4', '8A5', '8A6', '8A7',
  '9A1', '9A2', '9A3', '9A4', '9A5', '9A6', '9A7'
];

async function main() {
  const passwordHash = await bcrypt.hash('Demo@123', 10);
  
  for (const className of CLASSES) {
    console.log(`Processing class ${className}...`);
    
    // 1. Create or find Teacher
    const teacherUsername = `gv.${className.toLowerCase()}`;
    let userT = await prisma.user.findUnique({ where: { username: teacherUsername } });
    if (!userT) {
      userT = await prisma.user.create({
        data: {
          username: teacherUsername,
          passwordHash,
          role: 'TEACHER',
        }
      });
    }
    
    let teacher = await prisma.teacher.findUnique({ where: { userId: userT.id } });
    if (!teacher) {
      teacher = await prisma.teacher.create({
        data: {
          userId: userT.id,
          fullName: `GVCN ${className}`,
        }
      });
    }
    
    // 2. Create or find Class
    const classCode = `TQD-${className}`;
    let cls = await prisma.class.findUnique({ where: { classCode } });
    if (!cls) {
      cls = await prisma.class.create({
        data: {
          name: className,
          year: 2025,
          classCode,
          teacherId: teacher.id,
        }
      });
    }
    
    // 3. Create 50 students
    let newStudentsCount = 0;
    for (let i = 1; i <= 50; i++) {
      const studentNum = i < 10 ? `0${i}` : `${i}`;
      const username = `${className}${studentNum}`;
      
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (!existingUser) {
        const user = await prisma.user.create({
          data: {
            username,
            passwordHash,
            role: 'STUDENT'
          }
        });
        
        const student = await prisma.student.create({
          data: {
            userId: user.id,
            fullName: `Học sinh ${username}`,
            classId: cls.id
          }
        });
        
        await prisma.studentProfile.create({
          data: { studentId: student.id }
        });
        
        newStudentsCount++;
      }
    }
    
    console.log(`Class ${className}: Created ${newStudentsCount} new students.`);
  }
  
  console.log('Done!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
