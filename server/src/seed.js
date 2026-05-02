/**
 * seed.js — Populate the database with realistic test data.
 *
 * Creates:
 *   - 2 seller users (with known passwords you can use to log in)
 *   - 1 buyer user
 *   - 6 gigs across different categories linked to real seller IDs
 *
 * Usage:
 *   node src/seed.js
 *
 * Credentials after seeding:
 *   seller1@skillhive.dev  /  Seller123!
 *   seller2@skillhive.dev  /  Seller123!
 *   buyer1@skillhive.dev   /  Buyer123!
 */

require('dotenv').config();
require('./config/database');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Gig = require('./models/gig');

const SALT_ROUNDS = 12;

async function seed() {
  try {
    console.log('⏳  Connecting to MongoDB…');
    // database.js connects on require; wait for the connection to be ready
    await new Promise((resolve, reject) => {
      if (mongoose.connection.readyState === 1) return resolve();
      mongoose.connection.once('open', resolve);
      mongoose.connection.once('error', reject);
    });
    console.log('✅  Connected');

    // ── Wipe existing seed data ────────────────────────────────────────────
    console.log('🗑   Clearing existing seed data…');
    await Promise.all([
      User.deleteMany({ email: /@skillhive\.dev$/ }),
      Gig.deleteMany({ tags: 'seeded' }),
    ]);

    // ── Create users ───────────────────────────────────────────────────────
    console.log('👤  Creating users…');
    const sellerPassword = await bcrypt.hash('Seller123!', SALT_ROUNDS);
    const buyerPassword  = await bcrypt.hash('Buyer123!', SALT_ROUNDS);

    const [seller1, seller2, buyer1] = await User.insertMany([
      {
        name: 'Arjun Kumar',
        email: 'seller1@skillhive.dev',
        password: sellerPassword,
        username: 'arjunkumar',
        role: 'seller',
        avatar: 'https://ui-avatars.com/api/?name=Arjun+Kumar&background=111111&color=C8F135&size=128',
        bio: 'Full-stack developer with 6 years of experience in React, Node.js and cloud infrastructure.',
        sellerLevel: 'top',
        isVerified: true,
        country: 'India',
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        languages: ['English', 'Hindi'],
      },
      {
        name: 'Priya Sharma',
        email: 'seller2@skillhive.dev',
        password: sellerPassword,
        username: 'priyasharma',
        role: 'seller',
        avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=111111&color=C8F135&size=128',
        bio: 'Creative UI/UX designer and brand strategist with 5 years crafting beautiful digital experiences.',
        sellerLevel: 'level2',
        isVerified: true,
        country: 'India',
        skills: ['Figma', 'Adobe XD', 'Illustrator', 'Branding'],
        languages: ['English', 'Hindi'],
      },
      {
        name: 'Rahul Mehta',
        email: 'buyer1@skillhive.dev',
        password: buyerPassword,
        username: 'rahulmehta',
        role: 'buyer',
        avatar: 'https://ui-avatars.com/api/?name=Rahul+Mehta&background=111111&color=C8F135&size=128',
        country: 'India',
        languages: ['English', 'Hindi'],
      },
    ]);

    console.log(`   Created: ${seller1.email}, ${seller2.email}, ${buyer1.email}`);

    // ── Create gigs ────────────────────────────────────────────────────────
    console.log('📦  Creating gigs…');
    await Gig.insertMany([
      {
        sellerId: seller1._id,
        title: 'I will build a full-stack React + Node.js web application',
        slug: 'fullstack-react-nodejs-web-application',
        category: 'development',
        subcategory: 'web-development',
        description: 'I will build a modern, responsive full-stack web application using React, Node.js, Express and MongoDB. Clean code, well documented, deployed to production.',
        tags: ['react', 'nodejs', 'fullstack', 'mongodb', 'seeded'],
        images: [
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
        ],
        packages: {
          basic: { name: 'Basic', price: 99, deliveryTime: 3, revisions: 1, features: ['1 page', 'Mobile responsive', 'Source code'] },
          standard: { name: 'Standard', price: 249, deliveryTime: 7, revisions: 3, features: ['5 pages', 'Mobile responsive', 'Source code', 'Auth system', '1 month support'] },
          premium: { name: 'Premium', price: 499, deliveryTime: 14, revisions: 5, features: ['Unlimited pages', 'Mobile responsive', 'Source code', 'Auth + Payment', 'API integration', '3 months support'] },
        },
        avgRating: 4.9,
        reviewCount: 87,
        orderCount: 102,
        isFeatured: true,
        isActive: true,
      },
      {
        sellerId: seller1._id,
        title: 'I will develop a REST API with Node.js, Express and MongoDB',
        slug: 'rest-api-nodejs-express-mongodb',
        category: 'development',
        subcategory: 'backend',
        description: 'Production-ready REST API with JWT authentication, rate limiting, validation, error handling, and comprehensive documentation.',
        tags: ['api', 'nodejs', 'express', 'mongodb', 'backend', 'seeded'],
        images: [
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
        ],
        packages: {
          basic: { name: 'Basic', price: 79, deliveryTime: 2, revisions: 1, features: ['5 endpoints', 'Basic auth', 'Postman docs'] },
          standard: { name: 'Standard', price: 179, deliveryTime: 5, revisions: 3, features: ['20 endpoints', 'JWT + Refresh', 'Full docs', 'Rate limiting'] },
          premium: { name: 'Premium', price: 349, deliveryTime: 10, revisions: 5, features: ['Unlimited endpoints', 'Advanced auth', 'Full docs', 'Deployment', 'WebSockets'] },
        },
        avgRating: 4.8,
        reviewCount: 54,
        orderCount: 68,
        isFeatured: false,
        isActive: true,
      },
      {
        sellerId: seller1._id,
        title: 'I will build and deploy an AI chatbot for your website',
        slug: 'ai-chatbot-website-openai',
        category: 'ai',
        subcategory: 'chatbots',
        description: 'Custom AI chatbot powered by OpenAI GPT-4. Trained on your business data, integrated into your website, with analytics dashboard.',
        tags: ['ai', 'chatbot', 'openai', 'gpt', 'seeded'],
        images: [
          'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
        ],
        packages: {
          basic: { name: 'Basic', price: 149, deliveryTime: 4, revisions: 1, features: ['Basic chatbot', 'FAQ trained', 'Web embed'] },
          standard: { name: 'Standard', price: 349, deliveryTime: 7, revisions: 2, features: ['Advanced chatbot', 'Custom training', 'Web + mobile', 'Analytics'] },
          premium: { name: 'Premium', price: 699, deliveryTime: 14, revisions: 3, features: ['Full AI agent', 'Custom training', 'All platforms', 'Analytics', '1 month support'] },
        },
        avgRating: 4.7,
        reviewCount: 23,
        orderCount: 29,
        isFeatured: true,
        isActive: true,
      },
      {
        sellerId: seller2._id,
        title: 'I will design a stunning modern logo for your brand',
        slug: 'modern-brand-logo-design',
        category: 'design',
        subcategory: 'logo-design',
        description: 'Professional logo design with unlimited revisions until you are 100% satisfied. Delivered in all formats including SVG, PNG, and PDF.',
        tags: ['logo', 'branding', 'design', 'illustrator', 'seeded'],
        images: [
          'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800',
        ],
        packages: {
          basic: { name: 'Basic', price: 39, deliveryTime: 2, revisions: 2, features: ['1 concept', 'PNG file'] },
          standard: { name: 'Standard', price: 89, deliveryTime: 3, revisions: 5, features: ['3 concepts', 'All file formats', 'Brand guidelines'] },
          premium: { name: 'Premium', price: 179, deliveryTime: 5, revisions: 999, features: ['5 concepts', 'All formats', 'Brand guidelines', 'Social media kit', 'Business card design'] },
        },
        avgRating: 4.9,
        reviewCount: 143,
        orderCount: 178,
        isFeatured: true,
        isActive: true,
      },
      {
        sellerId: seller2._id,
        title: 'I will design a high-converting landing page in Figma',
        slug: 'high-converting-landing-page-figma',
        category: 'design',
        subcategory: 'ui-ux',
        description: 'Beautiful, conversion-optimized landing page design in Figma. Includes desktop and mobile versions, component library, and handoff-ready specs.',
        tags: ['figma', 'landing page', 'ui', 'ux', 'design', 'seeded'],
        images: [
          'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&q=80&w=800',
        ],
        packages: {
          basic: { name: 'Basic', price: 59, deliveryTime: 3, revisions: 2, features: ['Desktop only', '1 section', 'PNG export'] },
          standard: { name: 'Standard', price: 129, deliveryTime: 5, revisions: 4, features: ['Desktop + Mobile', 'Full page', 'Figma file', 'Component library'] },
          premium: { name: 'Premium', price: 249, deliveryTime: 7, revisions: 999, features: ['Desktop + Mobile', 'Full page', 'Figma file', 'Component library', 'Dev handoff', '3 variants'] },
        },
        avgRating: 4.8,
        reviewCount: 67,
        orderCount: 82,
        isFeatured: false,
        isActive: true,
      },
      {
        sellerId: seller2._id,
        title: 'I will create a high-converting digital marketing strategy',
        slug: 'digital-marketing-strategy-growth',
        category: 'marketing',
        subcategory: 'digital-marketing',
        description: 'Complete digital marketing strategy covering SEO, social media, email campaigns, and paid ads. Includes competitor analysis and 90-day roadmap.',
        tags: ['marketing', 'seo', 'social media', 'growth', 'seeded'],
        images: [
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
        ],
        packages: {
          basic: { name: 'Basic', price: 79, deliveryTime: 3, revisions: 1, features: ['SEO audit', 'Keyword research', 'Basic report'] },
          standard: { name: 'Standard', price: 179, deliveryTime: 7, revisions: 2, features: ['Full strategy', 'SEO + Social', 'Email templates', 'Monthly report'] },
          premium: { name: 'Premium', price: 349, deliveryTime: 10, revisions: 3, features: ['Full strategy', 'All channels', 'Ad campaigns', 'Weekly reports', '1:1 strategy calls'] },
        },
        avgRating: 4.6,
        reviewCount: 38,
        orderCount: 44,
        isFeatured: false,
        isActive: true,
      },
    ]);

    console.log('   Created 6 gigs');
    console.log('\n✅  Seeding complete!\n');
    console.log('📋  Login credentials:');
    console.log('   seller1@skillhive.dev  /  Seller123!  (role: seller, level: top)');
    console.log('   seller2@skillhive.dev  /  Seller123!  (role: seller, level: level2)');
    console.log('   buyer1@skillhive.dev   /  Buyer123!   (role: buyer)');

  } catch (error) {
    console.error('❌  Seed failed:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key — run the script again (it will clear seed data first) or check for conflicts with existing usernames/slugs.');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌  Disconnected from MongoDB');
  }
}

seed();
