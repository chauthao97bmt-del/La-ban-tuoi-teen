const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Demo@123', 10);

  // 1. Cô Hà (username: co.ha) - GVCN 8A7
  let userHa = await prisma.user.findUnique({ where: { username: 'co.ha' }, include: { teacher: true } });
  if (!userHa) {
    userHa = await prisma.user.create({
      data: {
        username: 'co.ha',
        passwordHash: hash,
        role: 'TEACHER',
        teacher: { create: { fullName: 'Cô Hà', avatar: '👩‍🏫' } }
      },
      include: { teacher: true }
    });
  } else {
    await prisma.user.update({
      where: { id: userHa.id },
      data: { passwordHash: hash, role: 'TEACHER' }
    });
    if (!userHa.teacher) {
      await prisma.teacher.create({
        data: { userId: userHa.id, fullName: 'Cô Hà', avatar: '👩‍🏫' }
      });
    } else {
      await prisma.teacher.update({
        where: { id: userHa.teacher.id },
        data: { fullName: 'Cô Hà' }
      });
    }
  }
  const teacherHa = await prisma.teacher.findUnique({ where: { userId: userHa.id } });
  if (teacherHa) {
    await prisma.class.updateMany({ where: { name: '8A7' }, data: { teacherId: teacherHa.id } });
  }

  // 2. Cô Thảo (username: co.thao và nguyenthi.chauthao) - GVCN 9A7
  let userThao = await prisma.user.findUnique({ where: { username: 'co.thao' }, include: { teacher: true } });
  if (!userThao) {
    userThao = await prisma.user.create({
      data: {
        username: 'co.thao',
        passwordHash: hash,
        role: 'TEACHER',
        teacher: { create: { fullName: 'Nguyễn Thị Châu Thảo', avatar: '👩‍🏫' } }
      },
      include: { teacher: true }
    });
  } else {
    await prisma.user.update({
      where: { id: userThao.id },
      data: { passwordHash: hash }
    });
    if (userThao.teacher) {
      await prisma.teacher.update({
        where: { id: userThao.teacher.id },
        data: { fullName: 'Nguyễn Thị Châu Thảo' }
      });
    }
  }

  // Tạo thêm alias nguyenthi.chauthao
  let userThaoAlias = await prisma.user.findUnique({ where: { username: 'nguyenthi.chauthao' } });
  if (!userThaoAlias) {
    await prisma.user.create({
      data: {
        username: 'nguyenthi.chauthao',
        passwordHash: hash,
        role: 'TEACHER'
      }
    });
  } else {
    await prisma.user.update({ where: { id: userThaoAlias.id }, data: { passwordHash: hash } });
  }

  const teacherThao = await prisma.teacher.findUnique({ where: { userId: userThao.id } });
  if (teacherThao) {
    await prisma.class.updateMany({ where: { name: '9A7' }, data: { teacherId: teacherThao.id } });
  }

  // Cập nhật gv.9a7 cũng có tên Nguyễn Thị Châu Thảo
  const gv9a7 = await prisma.user.findUnique({ where: { username: 'gv.9a7' }, include: { teacher: true } });
  if (gv9a7 && gv9a7.teacher) {
    await prisma.teacher.update({ where: { id: gv9a7.teacher.id }, data: { fullName: 'Nguyễn Thị Châu Thảo' } });
  }

  console.log('SUCCESS: Setup Cô Hà (co.ha) & Cô Thảo (co.thao / nguyenthi.chauthao)!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
