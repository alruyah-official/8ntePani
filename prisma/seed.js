// prisma/seed.js — Database seeder for 8ntePani
// Run with: pnpm prisma db seed
//
// Uses upsert (create-or-skip) so it's fully idempotent —
// running multiple times will never produce duplicate categories.

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: 'Graphic Design',      slug: 'graphic-design'      },
  { name: 'Web Development',     slug: 'web-development'     },
  { name: 'Video Editing',       slug: 'video-editing'       },
  { name: 'Content Writing',     slug: 'content-writing'     },
  { name: 'Digital Marketing',   slug: 'digital-marketing'   },
  { name: 'UI/UX Design',        slug: 'ui-ux-design'        },
  { name: 'Mobile Development',  slug: 'mobile-development'  },
  { name: 'Photography',         slug: 'photography'         },
];

async function main() {
  console.log('🌱  Seeding categories...\n');

  for (const category of CATEGORIES) {
    const record = await prisma.category.upsert({
      where:  { slug: category.slug },
      update: {},                    // no-op if it already exists
      create: category,
    });
    console.log(`  ✅  ${record.name} (${record.slug})`);
  }

  console.log('\n🎉  Seeding complete!');
}

main()
  .catch((error) => {
    console.error('❌  Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
