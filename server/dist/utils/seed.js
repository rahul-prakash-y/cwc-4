import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { Task } from '../models/Task.js';
import { Score } from '../models/Score.js';
import { Announcement } from '../models/Announcement.js';
import { DailyVoteLog } from '../models/VoteLog.js';
async function seedDatabase() {
    const mongoUri = env.MONGO_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cwc-season4';
    console.log(`🎪 Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully.');
    // Clear existing collections
    console.log('🧹 Cleaning existing database collections...');
    await Promise.all([
        User.deleteMany({}),
        Team.deleteMany({}),
        Task.deleteMany({}),
        Score.deleteMany({}),
        Announcement.deleteMany({}),
        DailyVoteLog.deleteMany({}),
    ]);
    console.log('✨ Database cleared.');
    // Password hashes
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedStudentPassword = await bcrypt.hash('student123', 10);
    // 1. Create Default SuperAdmin & Admin Users
    console.log('👑 Creating default Admin accounts...');
    const superAdmin = await User.create({
        name: 'Ringmaster SuperAdmin',
        email: 'superadmin@cwc.com',
        password: hashedAdminPassword,
        role: 'superadmin',
        isBlocked: false,
        isPasswordChanged: true,
    });
    const admin = await User.create({
        name: 'Carnival Admin',
        email: 'admin@cwc.com',
        password: hashedAdminPassword,
        role: 'admin',
        isBlocked: false,
        isPasswordChanged: true,
    });
    console.log(`✅ Default SuperAdmin created: superadmin@cwc.com / admin123`);
    console.log(`✅ Default Admin created: admin@cwc.com / admin123`);
    // 2. Create 12 Teams with Carnival Theme Colors & Logos
    console.log('🎪 Seeding 12 Teams and associated Student accounts...');
    const teamsData = [
        {
            teamName: 'Cyber Circus Kings',
            themeColor: '#FFD700',
            logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            status: 'Qualified',
            residenceType: 'Hosteller',
            totalPublicVotes: 142,
            leader: { name: 'Aarav Sharma', email: 'aarav@cwc.com', phone: '+91 9876543210' },
            members: [
                { name: 'Rhea Kapoor', email: 'rhea@cwc.com', role: 'Fullstack' },
                { name: 'Dev Patel', email: 'dev@cwc.com', role: 'Backend' },
            ],
            advantages: [
                { advantage: '2x Double Points', quantity: 2 },
                { advantage: 'Immunity Shield', quantity: 1 },
            ],
            immunity: true,
        },
        {
            teamName: 'Neon Ringmasters',
            themeColor: '#FF0055',
            logoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            status: 'Approved',
            residenceType: 'Hosteller',
            totalPublicVotes: 118,
            leader: { name: 'Vikram Mehta', email: 'vikram@cwc.com', phone: '+91 9876543211' },
            members: [
                { name: 'Ananya Rao', email: 'ananya@cwc.com', role: 'Frontend' },
                { name: 'Kabir Roy', email: 'kabir@cwc.com', role: 'Designer' },
            ],
            advantages: [{ advantage: 'Golden Hint Wheel', quantity: 1 }],
            immunity: false,
        },
        {
            teamName: 'Jesters of Java',
            themeColor: '#00F0FF',
            logoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
            status: 'Approved',
            residenceType: 'Day Scholar',
            totalPublicVotes: 95,
            leader: { name: 'Siddharth Joshi', email: 'sid@cwc.com', phone: '+91 9876543212' },
            members: [
                { name: 'Pooja Verma', email: 'pooja@cwc.com', role: 'Fullstack' },
                { name: 'Rohan Gupta', email: 'rohan@cwc.com', role: 'Backend' },
            ],
            advantages: [{ advantage: '30-Min Time Extension', quantity: 1 }],
            immunity: false,
        },
        {
            teamName: 'High Wire Hackers',
            themeColor: '#8A2BE2',
            logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            status: 'Safe',
            residenceType: 'Hosteller',
            totalPublicVotes: 84,
            leader: { name: 'Neha Nair', email: 'neha@cwc.com', phone: '+91 9876543213' },
            members: [
                { name: 'Arjun Singhania', email: 'arjun@cwc.com', role: 'Backend' },
                { name: 'Meera Deshmukh', email: 'meera@cwc.com', role: 'Frontend' },
            ],
            advantages: [{ advantage: '2x Double Points', quantity: 1 }],
            immunity: false,
        },
        {
            teamName: 'Firebreather Code',
            themeColor: '#FF7700',
            logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            status: 'Safe',
            residenceType: 'Day Scholar',
            totalPublicVotes: 76,
            leader: { name: 'Tanya Sen', email: 'tanya@cwc.com', phone: '+91 9876543214' },
            members: [
                { name: 'Karan Saxena', email: 'karan@cwc.com', role: 'Fullstack' },
                { name: 'Isha Bhasin', email: 'isha@cwc.com', role: 'Designer' },
            ],
            advantages: [],
            immunity: false,
        },
        {
            teamName: 'Ferris Wheel Functions',
            themeColor: '#39FF14',
            logoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
            status: 'Danger',
            residenceType: 'Hosteller',
            totalPublicVotes: 64,
            leader: { name: 'Yash Vardhan', email: 'yash@cwc.com', phone: '+91 9876543215' },
            members: [
                { name: 'Divya Iyer', email: 'divya@cwc.com', role: 'Frontend' },
                { name: 'Aditya Kumar', email: 'aditya@cwc.com', role: 'Backend' },
            ],
            advantages: [],
            immunity: false,
        },
        {
            teamName: 'Carnival Cryptographers',
            themeColor: '#FF007F',
            logoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
            status: 'Approved',
            residenceType: 'Day Scholar',
            totalPublicVotes: 58,
            leader: { name: 'Rahul Roy', email: 'rahul@cwc.com', phone: '+91 9876543216' },
            members: [
                { name: 'Sneha Reddy', email: 'sneha@cwc.com', role: 'Security' },
                { name: 'Varun Joshi', email: 'varun@cwc.com', role: 'Backend' },
            ],
            advantages: [{ advantage: 'Immunity Shield', quantity: 1 }],
            immunity: true,
        },
        {
            teamName: 'Carousel Coders',
            themeColor: '#00E5FF',
            logoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            status: 'Approved',
            residenceType: 'Hosteller',
            totalPublicVotes: 49,
            leader: { name: 'Priya Malik', email: 'priya@cwc.com', phone: '+91 9876543217' },
            members: [
                { name: 'Amit Singh', email: 'amit@cwc.com', role: 'Fullstack' },
                { name: 'Simran Kaur', email: 'simran@cwc.com', role: 'Frontend' },
            ],
            advantages: [],
            immunity: false,
        },
        {
            teamName: 'Trapeze Techies',
            themeColor: '#9D00FF',
            logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            status: 'Safe',
            residenceType: 'Hosteller',
            totalPublicVotes: 42,
            leader: { name: 'Manish Sharma', email: 'manish@cwc.com', phone: '+91 9876543218' },
            members: [
                { name: 'Ritu Chawla', email: 'ritu@cwc.com', role: 'DevOps' },
                { name: 'Gaurav Das', email: 'gaurav@cwc.com', role: 'Backend' },
            ],
            advantages: [],
            immunity: false,
        },
        {
            teamName: 'Fortune Teller Devs',
            themeColor: '#FF355E',
            logoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            status: 'Approved',
            residenceType: 'Day Scholar',
            totalPublicVotes: 35,
            leader: { name: 'Shweta Pandey', email: 'shweta@cwc.com', phone: '+91 9876543219' },
            members: [
                { name: 'Nikhil Agarwal', email: 'nikhil@cwc.com', role: 'Fullstack' },
                { name: 'Kavita Pillai', email: 'kavita@cwc.com', role: 'Frontend' },
            ],
            advantages: [],
            immunity: false,
        },
        {
            teamName: 'Bumper Car Bytes',
            themeColor: '#00FFCC',
            logoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
            status: 'Danger',
            residenceType: 'Day Scholar',
            totalPublicVotes: 28,
            leader: { name: 'Deepak Choudhary', email: 'deepak@cwc.com', phone: '+91 9876543220' },
            members: [
                { name: 'Sonal Jain', email: 'sonal@cwc.com', role: 'Mobile' },
                { name: 'Tarun Saxena', email: 'tarun@cwc.com', role: 'Backend' },
            ],
            advantages: [],
            immunity: false,
        },
        {
            teamName: 'Circus Syntax Squad',
            themeColor: '#FF9900',
            logoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            status: 'Approved',
            residenceType: 'Hosteller',
            totalPublicVotes: 20,
            leader: { name: 'Kunal Kapoor', email: 'kunal@cwc.com', phone: '+91 9876543221' },
            members: [
                { name: 'Alok Mishra', email: 'alok@cwc.com', role: 'Fullstack' },
                { name: 'Tanvi Shah', email: 'tanvi@cwc.com', role: 'Designer' },
            ],
            advantages: [],
            immunity: false,
        },
    ];
    const createdTeams = [];
    for (const tData of teamsData) {
        // Create Student user account for leader
        const leaderUser = await User.create({
            name: tData.leader.name,
            email: tData.leader.email,
            password: hashedStudentPassword,
            role: 'student',
            isBlocked: false,
            isPasswordChanged: true,
        });
        const memberUsers = [];
        for (const mem of tData.members) {
            const u = await User.create({
                name: mem.name,
                email: mem.email,
                password: hashedStudentPassword,
                role: 'student',
                isBlocked: false,
                isPasswordChanged: true,
            });
            memberUsers.push({
                name: mem.name,
                email: mem.email,
                role: mem.role,
                userId: u._id,
            });
        }
        const team = await Team.create({
            teamName: tData.teamName,
            themeColor: tData.themeColor,
            logoUrl: tData.logoUrl,
            status: tData.status,
            residenceType: tData.residenceType,
            totalPublicVotes: tData.totalPublicVotes,
            leader: {
                name: tData.leader.name,
                email: tData.leader.email,
                phone: tData.leader.phone,
                userId: leaderUser._id,
            },
            members: memberUsers,
            advantages: tData.advantages,
            immunity: tData.immunity,
        });
        createdTeams.push(team);
    }
    console.log(`✅ Created ${createdTeams.length} teams with active student logins (Password: student123).`);
    // 3. Create 10 Days of Tasks (MCQs, Coding, Rapid Fire)
    console.log('📅 Seeding 10 Days of Carnival Tasks...');
    const now = new Date();
    const tasksData = [
        {
            dayNumber: 1,
            title: 'The Grand Opening Parade Quiz',
            description: 'Rapid-fire algorithmic warm-up quiz and logic speed run.',
            type: 'MCQ',
            points: 150,
            options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
            correctAnswer: 'O(log N)',
            interactiveTimeLimit: 120,
            visibility: true,
            startTime: new Date(now.getTime() - 9 * 86400000),
            endTime: new Date(now.getTime() + 1 * 86400000),
        },
        {
            dayNumber: 2,
            title: "Ring Master's Code Relay",
            description: 'Tag-team coding battle where teams pass the baton to solve string permutations.',
            type: 'Coding',
            points: 250,
            testCases: [
                { input: 'abc', expectedOutput: 'abc,acb,bac,bca,cab,cba', hidden: false },
                { input: 'a', expectedOutput: 'a', hidden: true },
            ],
            interactiveTimeLimit: 300,
            visibility: true,
            startTime: new Date(now.getTime() - 8 * 86400000),
            endTime: new Date(now.getTime() + 1 * 86400000),
        },
        {
            dayNumber: 3,
            title: 'High Wire Algo Clash',
            description: 'Graph traversal and dynamic programming under extreme pressure.',
            type: 'Rapid Fire',
            points: 300,
            options: ['Dijkstra', 'BFS', 'Kruskal', 'Floyd-Warshall'],
            correctAnswer: 'Dijkstra',
            interactiveTimeLimit: 45,
            visibility: true,
            startTime: new Date(now.getTime() - 7 * 86400000),
            endTime: new Date(now.getTime() + 1 * 86400000),
        },
        {
            dayNumber: 4,
            title: "Clown's Bug Fix Circus",
            description: 'Hunt down 10 obfuscated security vulnerabilities and memory leaks in Node.js.',
            type: 'Code Completion',
            points: 200,
            correctAnswer: 'sanitizeInput(payload)',
            interactiveTimeLimit: 180,
            visibility: true,
            startTime: new Date(now.getTime() - 6 * 86400000),
            endTime: new Date(now.getTime() + 1 * 86400000),
        },
        {
            dayNumber: 5,
            title: 'Mid-Season Arena Boss Fight',
            description: 'Build a dynamic real-time multiplayer WebSocket state manager within 4 hours.',
            type: 'Boss Fight',
            points: 500,
            interactiveTimeLimit: 600,
            visibility: true,
            startTime: new Date(now.getTime() - 5 * 86400000),
            endTime: new Date(now.getTime() + 2 * 86400000),
        },
        {
            dayNumber: 6,
            title: 'Magic Illusion Hackathon',
            description: 'Create mind-bending UI animations and glassmorphism web apps.',
            type: 'Output Prediction',
            points: 350,
            correctAnswer: 'transform 3d scale(1.05)',
            interactiveTimeLimit: 120,
            visibility: true,
            startTime: new Date(now.getTime() - 4 * 86400000),
            endTime: new Date(now.getTime() + 3 * 86400000),
        },
        {
            dayNumber: 7,
            title: 'Trapeze Speed Sprint',
            description: 'Optimize API query response speeds from 2000ms down to sub-10ms using Redis caching.',
            type: 'Rapid Fire',
            points: 300,
            options: ['Redis SETEX', 'MongoDB Index', 'In-memory Map', 'All of the above'],
            correctAnswer: 'All of the above',
            interactiveTimeLimit: 30,
            visibility: true,
            startTime: new Date(now.getTime() - 3 * 86400000),
            endTime: new Date(now.getTime() + 4 * 86400000),
        },
        {
            dayNumber: 8,
            title: 'Fortune Teller Security Maze',
            description: 'Cryptography, JWT authentication, and token vault cracking.',
            type: 'MCQ',
            points: 250,
            options: ['RS256', 'HS256', 'MD5', 'AES-256'],
            correctAnswer: 'RS256',
            interactiveTimeLimit: 90,
            visibility: true,
            startTime: new Date(now.getTime() - 2 * 86400000),
            endTime: new Date(now.getTime() + 5 * 86400000),
        },
        {
            dayNumber: 9,
            title: 'Carnival Final Showdown',
            description: 'Full-stack application deployment with Cloudinary & GitHub Webhooks.',
            type: 'Boss Fight',
            points: 600,
            visibility: true,
            startTime: new Date(now.getTime() - 1 * 86400000),
            endTime: new Date(now.getTime() + 6 * 86400000),
        },
        {
            dayNumber: 10,
            title: 'Grand Finale & Champion Coronation',
            description: 'Live presentation to judges, score tally, and trophy awarding ceremony.',
            type: 'Boss Fight',
            points: 1000,
            visibility: true,
            startTime: now,
            endTime: new Date(now.getTime() + 7 * 86400000),
        },
    ];
    const createdTasks = await Task.insertMany(tasksData);
    console.log(`✅ Created ${createdTasks.length} Days of Tasks.`);
    // 4. Seed initial Scores for teams to make competition dynamic
    console.log('🏆 Assigning initial task scores to teams...');
    const baseScores = [450, 420, 380, 350, 310, 280, 250, 220, 190, 160, 130, 100];
    for (let i = 0; i < createdTeams.length; i++) {
        await Score.create({
            team: createdTeams[i]._id,
            task: createdTasks[0]._id,
            pointsEarned: baseScores[i],
        });
    }
    // 5. Seed Announcement
    await Announcement.create({
        title: '🎪 CWC Season 4 Daily Voting System is LIVE!',
        content: 'All teams can now cast up to 100 votes daily (max 15 per team) in the Fan Favorite Voting Booth!',
        pinned: true,
    });
    console.log('\n🎉 ==================================================== 🎉');
    console.log('🚀 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('👑 Admin: superadmin@cwc.com / admin123');
    console.log('🎓 Sample Student: aarav@cwc.com / student123');
    console.log('🎪 12 Teams, 10 Tasks & Public Votes successfully populated.');
    console.log('🎉 ==================================================== 🎉\n');
    process.exit(0);
}
seedDatabase().catch((err) => {
    console.error('❌ Database seeding failed:', err);
    process.exit(1);
});
