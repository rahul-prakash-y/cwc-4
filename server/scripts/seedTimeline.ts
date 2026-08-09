import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import TimelineDay from '../src/models/Timeline.js';
import Task from '../src/models/Task.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cwc';

export const OFFICIAL_TIMELINE_DATA = [
  {
    dayNumber: 1,
    theme: 'C PROGRAMMING',
    daywiseName: 'INTRODUCTION WEEK - NO ELIMINATION',
    eliminationInfo: '0-11',
    tasks: [
      { category: 'LUCKY BOOTH', taskDescription: 'Draw and find', timeLimit: '15 MINS' },
      { category: 'GRAND CHALLENGE', taskDescription: 'MCQ', timeLimit: '20 MINS' },
      { category: 'FUN FAIR', taskDescription: 'Tongue twister', timeLimit: '2 MINS EACH TEAM' },
      { category: 'DANGER ZONE', taskDescription: 'C puzzle', timeLimit: '10 MIN' },
      { category: 'GOLDEN ZONE', taskDescription: 'Guess the movie by its heroine cast name', timeLimit: '3 MINS EACH TEAM' },
    ],
  },
  {
    dayNumber: 2,
    theme: 'C++',
    daywiseName: 'FIRST COMPETATIVE WEEK',
    eliminationInfo: '1-11',
    tasks: [
      { category: 'LUCKY BOOTH', taskDescription: 'Act to find', timeLimit: '15 MINS' },
      { category: 'GRAND CHALLENGE', taskDescription: 'Coding', timeLimit: '20 MINS' },
      { category: 'FUN FAIR', taskDescription: 'Give the correct logo', timeLimit: '2 MINS EACH TEAM' },
      { category: 'DANGER ZONE', taskDescription: 'C++ find error', timeLimit: '10 MIN' },
      { category: 'GOLDEN ZONE', taskDescription: 'Guess the movie by plot', timeLimit: '3 MINS EACH TEAM' },
    ],
  },
  {
    dayNumber: 3,
    theme: 'SQL',
    daywiseName: 'NEW SKILL UNLOCKING EPISODE',
    eliminationInfo: '1-10',
    tasks: [
      { category: 'LUCKY BOOTH', taskDescription: 'General knowledge', timeLimit: '10 MINS' },
      { category: 'GRAND CHALLENGE', taskDescription: 'Guess', timeLimit: '15 MINS' },
      { category: 'FUN FAIR', taskDescription: 'Bitting (time & solve)', timeLimit: '2 MIN EACH TEAM' },
      { category: 'DANGER ZONE', taskDescription: 'SQL', timeLimit: '5 MIN' },
      { category: 'GOLDEN ZONE', taskDescription: 'Guess the lyrics', timeLimit: '5 MINS' },
    ],
  },
  {
    dayNumber: 4,
    theme: 'PYTHON',
    daywiseName: 'END OF SOLO SKILL WEEK',
    eliminationInfo: '1-9',
    tasks: [
      { category: 'LUCKY BOOTH', taskDescription: 'Give the Brand', timeLimit: '30 SEC PER TEAM' },
      { category: 'GRAND CHALLENGE', taskDescription: 'Debug', timeLimit: '15 MIN' },
      { category: 'FUN FAIR', taskDescription: 'Draw the object & find the object', timeLimit: '2 MINS PER TEAM' },
      { category: 'DANGER ZONE', taskDescription: 'Python function based solution', timeLimit: '5 MIN' },
      { category: 'GOLDEN ZONE', taskDescription: 'Find the Different', timeLimit: '3 MIN' },
    ],
  },
  {
    dayNumber: 5,
    theme: 'TICKET TO FINALE JAVA + FIGMA',
    daywiseName: 'HALF WAY TO FINALE - CELEBRATION WEEK',
    eliminationInfo: '1-8',
    tasks: [
      { category: 'LUCKY BOOTH', taskDescription: 'Aptitude', timeLimit: '15 MIN' },
      { category: 'GRAND CHALLENGE', taskDescription: 'Riddles', timeLimit: '15 MIN' },
      { category: 'FUN FAIR', taskDescription: 'Guess the ingrident', timeLimit: '2 MIN PER TEAM' },
      { category: 'DANGER ZONE', taskDescription: 'Java Pseudo code', timeLimit: '10 MIN' },
      { category: 'GOLDEN ZONE', taskDescription: 'Guess the movie (by Hero, Heroine, Director)', timeLimit: '10 MIN' },
    ],
  },
  {
    dayNumber: 6,
    theme: 'SEMI FINALE',
    daywiseName: 'BACK TO BACK ELIMINATIONS',
    eliminationInfo: '1-7',
    tasks: [
      { category: 'LUCKY BOOTH', taskDescription: 'Typewriting challenge', timeLimit: '10 MIN' },
      { category: 'GRAND CHALLENGE', taskDescription: 'All', timeLimit: '15 MIN' },
      { category: 'FUN FAIR', taskDescription: '-', timeLimit: '3 MIN PER TEAM' },
      { category: 'DANGER ZONE', taskDescription: 'Guess the correct syntax', timeLimit: '5 MIN' },
      { category: 'GOLDEN ZONE', taskDescription: '-', timeLimit: '3 MIN PER TEAM' },
    ],
  },
  {
    dayNumber: 7,
    theme: 'GRAND FINALE',
    daywiseName: 'TICKET TO FINALE',
    eliminationInfo: '0-6',
    tasks: [
      { category: 'LUCKY BOOTH', taskDescription: 'Logical reasoning', timeLimit: '10 MIN' },
      { category: 'GRAND CHALLENGE', taskDescription: 'All', timeLimit: '15 MIN' },
      { category: 'FUN FAIR', taskDescription: '-', timeLimit: '2 MINS PER TEAM' },
      { category: 'DANGER ZONE', taskDescription: '-', timeLimit: '10 MIN' },
      { category: 'GOLDEN ZONE', taskDescription: '-', timeLimit: '5 MIN' },
    ],
  },
];

export async function seedTimelineData() {
  try {
    console.log('Connecting to MongoDB for Timeline Seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    // Clear existing Timeline Days & Tasks for days 1-7
    await TimelineDay.deleteMany({});
    await Task.deleteMany({ dayNumber: { $gte: 1, $lte: 7 } });

    console.log('Cleared previous timeline days & timeline tasks.');

    for (const day of OFFICIAL_TIMELINE_DATA) {
      // Create TimelineDay document
      const timelineDayDoc = await TimelineDay.create({
        dayNumber: day.dayNumber,
        theme: day.theme,
        daywiseName: day.daywiseName,
        eliminationInfo: day.eliminationInfo,
      });

      console.log(`Created Day ${day.dayNumber}: ${day.theme} (${day.daywiseName})`);

      // Create 5 Tasks per day
      for (const t of day.tasks) {
        await Task.create({
          dayNumber: day.dayNumber,
          category: t.category,
          taskDescription: t.taskDescription,
          timeLimit: t.timeLimit,
          title: `${day.theme} - ${t.category}`,
          description: t.taskDescription,
          visibility: true,
        });
      }
    }

    console.log('🎉 Successfully seeded 7-Day Timeline and 35 Category Tasks into MongoDB!');
  } catch (err) {
    console.error('Error seeding timeline:', err);
    throw err;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

if (process.argv[1]?.endsWith('seedTimeline.ts') || process.argv[1]?.endsWith('seedTimeline.js')) {
  seedTimelineData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
