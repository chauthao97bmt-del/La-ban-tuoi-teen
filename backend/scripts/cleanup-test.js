const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const u = await p.user.findUnique({ where: { username: '8A646' }, include: { student: true } });
  const sid = u.student.id;
  const a = await p.assessment.deleteMany({ where: { studentId: sid } });
  const c = await p.challengeProgress.deleteMany({ where: { studentId: sid } });
  const e = await p.careerExploration.deleteMany({ where: { studentId: sid } });
  await p.studentProfile.update({ where: { studentId: sid }, data: { xp: 0, level: 1, riasecScores: '{}' } });
  await p.notification.deleteMany({ where: { userId: u.id } });
  console.log('cleaned', a.count, c.count, e.count);
  await p.$disconnect();
})();
