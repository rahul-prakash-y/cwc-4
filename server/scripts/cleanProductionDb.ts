import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Team } from '../src/models/Team.js';
import { Task } from '../src/models/Task.js';
import { Score } from '../src/models/Score.js';
import { Announcement } from '../src/models/Announcement.js';
import { Submission } from '../src/models/Submission.js';
import { Settings } from '../src/models/Settings.js';
import { Setting } from '../src/models/Setting.js';
import { Gallery } from '../src/models/Gallery.js';
import { Draft } from '../src/models/Draft.js';
import { Attendance } from '../src/models/Attendance.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { DailyVoteLog } from '../src/models/VoteLog.js';

async function cleanProductionDb() {
  const mongoUri = env.MONGO_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cwc-season4';

  console.log(`🎪 Connecting to Production MongoDB at: ${mongoUri}`);
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB successfully.');

  // 1. Wipe all documents from all operational collections
  console.log('🧹 Purging all documents from production collections...');
  await Promise.all([
    Team.deleteMany({}),
    Task.deleteMany({}),
    Score.deleteMany({}),
    Announcement.deleteMany({}),
    DailyVoteLog.deleteMany({}),
    AuditLog.deleteMany({}),
    Gallery.deleteMany({}),
    Attendance.deleteMany({}),
    Submission.deleteMany({}),
    Draft.deleteMany({}),
    User.deleteMany({}),
    Settings.deleteMany({}),
    Setting.deleteMany({}),
  ]);
  console.log('✨ All production collections wiped completely. Mock data removed.');

  // 2. Ensure initial SuperAdmin account
  const superAdminEmail = (process.env.SUPERADMIN_EMAIL || env.SUPERADMIN_EMAIL || 'superadmin@cwc.com').toLowerCase().trim();
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || env.SUPERADMIN_PASSWORD || 'SuperAdmin@CWC2026!';

  console.log(`👑 Seeding initial SuperAdmin account (${superAdminEmail})...`);
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  const superAdmin = await User.create({
    name: 'Super Admin',
    email: superAdminEmail,
    passwordHash: hashedPassword,
    role: 'superadmin',
    isBlocked: false,
    isFirstLogin: false,
  });

  console.log(`✅ Initial SuperAdmin seeded successfully with ID: ${superAdmin._id}`);

  // 3. Initialize single Settings CMS document with production defaults
  console.log('⚙️ Initializing production Global Settings CMS document...');
  const settingsDoc = await Settings.create({
    eventStartDate: new Date('2026-08-15T10:00:00.000Z'),
    currentSeason: 4,
    isRegistrationOpen: true,
    isLeaderboardVisible: true,
    heroBannerText: 'Welcome to Code With Curious Season 4! The Ultimate Coding Carnival.',
    isGrandFinale: false,
  });

  // Also sync legacy Setting key-value document for isGrandFinale
  await Setting.findOneAndUpdate(
    { key: 'isGrandFinale' },
    { value: false },
    { upsert: true, new: true }
  );

  console.log(`✅ Global Settings initialized (Season: ${settingsDoc.currentSeason}, GrandFinale: ${settingsDoc.isGrandFinale}).`);

  console.log('\n🎉 ==================================================== 🎉');
  console.log('🚀 PRODUCTION RESET COMPLETED SUCCESSFULLY!');
  console.log(`👑 SuperAdmin Email: ${superAdminEmail}`);
  console.log('🔒 Database status: Cleaned, zero mock data, ready for live launch.');
  console.log('🎉 ==================================================== 🎉\n');

  process.exit(0);
}

cleanProductionDb().catch((err) => {
  console.error('❌ Production reset failed:', err);
  process.exit(1);
});
