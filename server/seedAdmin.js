// seedAdmin.js
// Run with: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret node seedAdmin.js
// Creates or updates an admin user in the database

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set as environment variables.');
  console.error('   Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret node seedAdmin.js');
  process.exit(1);
}

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      existing.role = 'admin';
      existing.isActive = true;
      await existing.save();
      console.log(`✅ Existing user updated to admin: ${existing.email}`);
    } else {
      const admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log(`✅ Admin user created: ${admin.email}`);
    }

    console.log('\n⚠️  Keep your credentials safe and never commit them!\n');
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
