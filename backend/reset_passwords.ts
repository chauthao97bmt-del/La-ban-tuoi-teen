import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const newHash = await bcrypt.hash('Demo@123', 10);
  const result = await prisma.user.updateMany({
    data: {
      passwordHash: newHash
    }
  });
  console.log(`Reset password to Demo@123 for ${result.count} users.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
