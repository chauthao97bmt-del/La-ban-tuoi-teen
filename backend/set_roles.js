const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Demo@123', 10);

  // 1. Cô Hà -> Chuyên gia tâm lý (PSYCHOLOGIST)
  let coHa = await prisma.user.findUnique({ where: { username: 'co.ha' }, include: { teacher: true } });
  if (!coHa) {
    coHa = await prisma.user.create({
      data: {
        username: 'co.ha',
        passwordHash: hash,
        role: 'PSYCHOLOGIST',
        teacher: { create: { fullName: 'Cô Hà (Chuyên gia tâm lý)', avatar: '👩‍⚕️', subject: 'Tư vấn tâm lý' } }
      },
      include: { teacher: true }
    });
  } else {
    await prisma.user.update({
      where: { id: coHa.id },
      data: { role: 'PSYCHOLOGIST', passwordHash: hash }
    });
    if (coHa.teacher) {
      await prisma.teacher.update({
        where: { id: coHa.teacher.id },
        data: { fullName: 'Cô Hà (Chuyên gia tâm lý)', avatar: '👩‍⚕️', subject: 'Tư vấn tâm lý' }
      });
    } else {
      await prisma.teacher.create({
        data: { userId: coHa.id, fullName: 'Cô Hà (Chuyên gia tâm lý)', avatar: '👩‍⚕️', subject: 'Tư vấn tâm lý' }
      });
    }
  }

  // 2. Cô Thảo -> Quản trị viên (ADMIN)
  // Tài khoản co.thao
  let coThao = await prisma.user.findUnique({ where: { username: 'co.thao' }, include: { teacher: true } });
  if (!coThao) {
    coThao = await prisma.user.create({
      data: {
        username: 'co.thao',
        passwordHash: hash,
        role: 'ADMIN',
        teacher: { create: { fullName: 'Cô Thảo (Admin)', avatar: '👑' } }
      },
      include: { teacher: true }
    });
  } else {
    await prisma.user.update({
      where: { id: coThao.id },
      data: { role: 'ADMIN', passwordHash: hash }
    });
    if (coThao.teacher) {
      await prisma.teacher.update({
        where: { id: coThao.teacher.id },
        data: { fullName: 'Cô Thảo (Admin)', avatar: '👑' }
      });
    } else {
      await prisma.teacher.create({
        data: { userId: coThao.id, fullName: 'Cô Thảo (Admin)', avatar: '👑' }
      });
    }
  }

  // Tài khoản nguyenthi.chauthao (cũng là ADMIN)
  let userThaoAlias = await prisma.user.findUnique({ where: { username: 'nguyenthi.chauthao' }, include: { teacher: true } });
  if (!userThaoAlias) {
    await prisma.user.create({
      data: {
        username: 'nguyenthi.chauthao',
        passwordHash: hash,
        role: 'ADMIN',
        teacher: { create: { fullName: 'Nguyễn Thị Châu Thảo (Admin)', avatar: '👑' } }
      }
    });
  } else {
    await prisma.user.update({
      where: { id: userThaoAlias.id },
      data: { role: 'ADMIN', passwordHash: hash }
    });
    if (userThaoAlias.teacher) {
      await prisma.teacher.update({
        where: { id: userThaoAlias.teacher.id },
        data: { fullName: 'Nguyễn Thị Châu Thảo (Admin)', avatar: '👑' }
      });
    } else {
      await prisma.teacher.create({
        data: { userId: userThaoAlias.id, fullName: 'Nguyễn Thị Châu Thảo (Admin)', avatar: '👑' }
      });
    }
  }

  console.log('SUCCESS! Roles updated:');
  console.log('- co.ha: PSYCHOLOGIST');
  console.log('- co.thao & nguyenthi.chauthao: ADMIN');
}

main().catch(console.error).finally(() => prisma.$disconnect());
