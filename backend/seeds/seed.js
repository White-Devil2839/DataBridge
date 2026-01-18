import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@databridge.com' },
    update: {},
    create: {
      email: 'admin@databridge.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@databridge.com' },
    update: {},
    create: {
      email: 'user@databridge.com',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log('Created user:', user.email);

  // Create sample connector (JSONPlaceholder API)
  const connector = await prisma.connector.upsert({
    where: { id: 'sample-connector-id' },
    update: {},
    create: {
      id: 'sample-connector-id',
      name: 'JSONPlaceholder API',
      baseUrl: 'https://jsonplaceholder.typicode.com',
      authType: 'NONE',
      authConfig: {},
      rateLimitConfig: {
        requestsPerSecond: 2,
      },
      endpointConfig: [
        {
          path: '/posts',
          method: 'GET',
        },
        {
          path: '/users',
          method: 'GET',
        },
      ],
      fieldMappingConfig: {
        mappings: [
          {
            source: 'id',
            target: 'id',
            type: 'number',
            isEntityKey: true,
          },
          {
            source: 'title',
            target: 'title',
            type: 'string',
          },
          {
            source: 'body',
            target: 'body',
            type: 'string',
          },
          {
            source: 'userId',
            target: 'userId',
            type: 'number',
          },
        ],
      },
      userId: admin.id,
    },
  });
  console.log('Created sample connector:', connector.name);

  console.log('Seeding completed!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@databridge.com / admin123');
  console.log('User: user@databridge.com / user123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
