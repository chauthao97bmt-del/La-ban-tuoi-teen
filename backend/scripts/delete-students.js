const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Đang tìm danh sách học sinh...');
  const students = await prisma.student.findMany();
  const studentIds = students.map(s => s.id);
  const userIds = students.map(s => s.userId);

  console.log(`Tìm thấy ${students.length} tài khoản học sinh. Đang xóa dữ liệu liên quan...`);

  // Xóa các bảng con (leaf nodes) tham chiếu đến Student
  await prisma.emotionCheckin.deleteMany({ where: { studentId: { in: studentIds } }});
  await prisma.studentSecretMission.deleteMany({ where: { studentId: { in: studentIds } }});
  await prisma.supportRequest.deleteMany({ where: { studentId: { in: studentIds } }});
  await prisma.careerExploration.deleteMany({ where: { studentId: { in: studentIds } }});
  await prisma.studentBadge.deleteMany({ where: { studentId: { in: studentIds } }});
  await prisma.challengeProgress.deleteMany({ where: { studentId: { in: studentIds } }});
  await prisma.goal.deleteMany({ where: { studentId: { in: studentIds } }});
  await prisma.journalEntry.deleteMany({ where: { studentId: { in: studentIds } }});
  await prisma.moodEntry.deleteMany({ where: { studentId: { in: studentIds } }});
  await prisma.assessment.deleteMany({ where: { studentId: { in: studentIds } }});
  await prisma.studentProfile.deleteMany({ where: { studentId: { in: studentIds } }});
  
  // Xóa các dữ liệu tham chiếu trực tiếp từ User
  await prisma.notification.deleteMany({ where: { userId: { in: userIds } }});
  await prisma.aiConversation.deleteMany({ where: { userId: { in: userIds } }});
  await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } }});
  
  console.log('Đang xóa thông tin Student...');
  await prisma.student.deleteMany({ where: { id: { in: studentIds } }});

  console.log('Đang xóa tài khoản User (vai trò STUDENT)...');
  await prisma.user.deleteMany({ where: { id: { in: userIds }, role: 'STUDENT' }});

  console.log('✅ Đã xóa thành công toàn bộ tài khoản học sinh.');
}

main()
  .catch(e => {
    console.error('Lỗi khi xóa:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
