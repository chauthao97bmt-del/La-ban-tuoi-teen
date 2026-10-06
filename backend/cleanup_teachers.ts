import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Delete classes with 0 students to clean up duplicates
  const emptyClasses = await prisma.class.findMany({
    include: { _count: { select: { students: true } } }
  });
  
  for (const c of emptyClasses) {
    if (c._count.students === 0) {
      await prisma.classAnnouncement.deleteMany({ where: { classId: c.id } });
      await prisma.class.delete({ where: { id: c.id } });
      console.log(`Deleted empty class: ${c.name} (${c.classCode})`);
    }
  }

  // 2. Assign teachers to specific classes
  // 9A4 = Cô Thu Hải (username: hothi.thuhai)
  let thuHai = await prisma.user.findUnique({ where: { username: 'hothi.thuhai' }, include: { teacher: true } });
  if (!thuHai) {
    const hash = await bcrypt.hash('Demo@123', 10);
    thuHai = await prisma.user.create({
      data: {
        username: 'hothi.thuhai',
        passwordHash: hash,
        role: 'TEACHER',
        teacher: { create: { fullName: 'Hồ Thị Thu Hải', avatar: '👩‍🏫' } }
      },
      include: { teacher: true }
    });
  }
  await prisma.class.updateMany({ where: { name: '9A4' }, data: { teacherId: thuHai.teacher!.id } });
  
  // 9A1 = Cô Tiền (tranthi.tien)
  let coTien = await prisma.user.findUnique({ where: { username: 'tranthi.tien' }, include: { teacher: true } });
  await prisma.class.updateMany({ where: { name: '9A1' }, data: { teacherId: coTien!.teacher!.id } });

  // 9A2 = Cô Nguyệt (tranthi.nguyet)
  let coNguyet = await prisma.user.findUnique({ where: { username: 'tranthi.nguyet' }, include: { teacher: true } });
  await prisma.class.updateMany({ where: { name: '9A2' }, data: { teacherId: coNguyet!.teacher!.id } });

  // 9A3 = Cô Thoa (username: co.thoa)
  let coThoa = await prisma.user.findUnique({ where: { username: 'co.thoa' }, include: { teacher: true } });
  if (!coThoa) {
    const hash = await bcrypt.hash('Demo@123', 10);
    coThoa = await prisma.user.create({
      data: {
        username: 'co.thoa',
        passwordHash: hash,
        role: 'TEACHER',
        teacher: { create: { fullName: 'Cô Thoa', avatar: '👩‍🏫' } }
      },
      include: { teacher: true }
    });
  }
  await prisma.class.updateMany({ where: { name: '9A3' }, data: { teacherId: coThoa.teacher!.id } });

  // 9A5 = Thầy Linh (username: thay.linh)
  let thayLinh = await prisma.user.findUnique({ where: { username: 'thay.linh' }, include: { teacher: true } });
  if (!thayLinh) {
    const hash = await bcrypt.hash('Demo@123', 10);
    thayLinh = await prisma.user.create({
      data: {
        username: 'thay.linh',
        passwordHash: hash,
        role: 'TEACHER',
        teacher: { create: { fullName: 'Thầy Linh', avatar: '👨‍🏫' } }
      },
      include: { teacher: true }
    });
  }
  await prisma.class.updateMany({ where: { name: '9A5' }, data: { teacherId: thayLinh.teacher!.id } });

  // 8A7 = Cô Hà (username: co.ha)
  let coHa = await prisma.user.findUnique({ where: { username: 'co.ha' }, include: { teacher: true } });
  if (coHa && !coHa.teacher) {
    await prisma.teacher.create({
      data: {
        userId: coHa.id,
        fullName: 'Cô Hà',
        avatar: '👩‍🏫'
      }
    });
    coHa = await prisma.user.findUnique({ where: { username: 'co.ha' }, include: { teacher: true } });
  }
  await prisma.class.updateMany({ where: { name: '8A7' }, data: { teacherId: coHa!.teacher!.id } });

  // 3. Delete extra teacher accounts that have NO students
  const allTeachers = await prisma.teacher.findMany({
    include: { classes: true, user: true }
  });
  
  for (const t of allTeachers) {
    if (t.classes.length === 0) {
      // Find if this teacher is associated with any classroom conversations
      await prisma.classroomConversation.deleteMany({ where: { teacherId: t.id } });
      
      // Delete the teacher profile
      await prisma.teacher.delete({ where: { id: t.id } });
      
      // If the user's role was TEACHER and they have no other profile, delete the user
      if (t.user.role === 'TEACHER' && t.user.username !== 'admin') {
         // Also delete their notifications to avoid foreign key error
         await prisma.notification.deleteMany({ where: { userId: t.user.id } });
         await prisma.user.delete({ where: { id: t.user.id } });
         console.log(`Deleted extra teacher account: ${t.user.username}`);
      } else {
         console.log(`Removed teacher profile for ${t.user.username} (role: ${t.user.role})`);
      }
    }
  }
  
  console.log('Cleanup and assignment completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
