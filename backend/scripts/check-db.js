const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const students = await p.student.count();
  const profiles = await p.studentProfile.count();
  const users = await p.user.count({ where: { role: 'STUDENT' } });
  console.log('Student records:', students);
  console.log('StudentProfile records:', profiles);
  console.log('User STUDENT records:', users);
  
  // Check if profile counts match
  if (students !== profiles) {
    console.log('\n⚠️ MISMATCH: Some students missing profiles!');
    // Find students without profile
    const noProfile = await p.student.findMany({
      where: { profile: null },
      select: { id: true, fullName: true }
    });
    console.log('Students without profile:', noProfile.length, noProfile.slice(0, 3));
  } else {
    console.log('\n✅ All students have profiles!');
  }
  
  // Test a specific student login flow
  const user9A101 = await p.user.findUnique({ where: { username: '9A101' }, include: { student: { include: { profile: true, class: true } } } });
  console.log('\n9A101 user exists:', !!user9A101);
  console.log('9A101 student exists:', !!user9A101?.student);
  console.log('9A101 profile exists:', !!user9A101?.student?.profile);
}
main().catch(console.error).finally(() => p.$disconnect());
