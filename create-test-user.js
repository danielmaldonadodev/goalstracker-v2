const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const prisma = new PrismaClient();
  
  const hash = await bcrypt.hash('12345678', 12);
  
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@test.com',
      passwordHash: hash,
    }
  });
  
  console.log('✅ Usuario creado:', user.email);
  await prisma.$disconnect();
}

createTestUser().catch(console.error);
