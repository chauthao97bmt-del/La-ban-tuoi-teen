import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { startsWith: '9A4' } },
        { username: { startsWith: '9A1' } },
        { username: { startsWith: '9a4' } },
        { username: { startsWith: '9a1' } },
      ]
    },
    select: {
      username: true,
      role: true
    }
  });
  console.log(`Found ${users.length} users in 9A1 and 9A4:`);
  console.log(users.map(u => u.username).join(', '));
  
  const allUsers = await prisma.user.findMany({
      select: { username: true }
  });
  console.log(`Total users in DB: ${allUsers.length}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
