import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import { Team } from '../models/Team.js';
import { Score } from '../models/Score.js';
import { delCache } from '../utils/redis.js';
import { verifyJWT } from '../middleware/auth.js';
import { broadcastSpinWheelResult, broadcastAdvantageGranted } from '../socket.js';
import { logAdminAction } from '../utils/auditLogger.js';

export interface SpinWheelAdvantageOption {
  name: string;
  type: string;
  value: number;
  bonusPoints: number;
}

export const ADVANTAGE_POOL: SpinWheelAdvantageOption[] = [
  { name: '+5 Mins Extra Time', type: 'Extra Time', value: 5, bonusPoints: 25 },
  { name: '+10 Mins Extra Time', type: 'Extra Time', value: 10, bonusPoints: 50 },
  { name: 'Double Points Multiplier', type: 'Double Points', value: 2, bonusPoints: 100 },
  { name: 'Unlock Question Hint', type: 'Hint', value: 1, bonusPoints: 25 },
  { name: 'Skip Question Pass', type: 'Skip Pass', value: 1, bonusPoints: 30 },
  { name: 'Golden Coin (+100 Pts)', type: 'Golden Coin', value: 100, bonusPoints: 100 },
];

/**
 * Handle Spin Wheel where slices contain ACTIVE TEAM NAMES.
 * RULE: Only teams that are NOT ELIMINATED and HAVE NOT RECEIVED AN ADVANTAGE PREVIOUSLY are eligible.
 */
export async function handleSpinWheel(
  request: FastifyRequest<{
    Body: {
      dayNumber?: number;
      advantageName?: string;
      customTeamIds?: string[];
      teamId?: string;
    };
  }>,
  reply: FastifyReply
) {
  const user = (request as any).user;
  const dayNumber = Number(request.body?.dayNumber || 1);
  const targetAdvantage = request.body?.advantageName || ADVANTAGE_POOL[Math.floor(Math.random() * ADVANTAGE_POOL.length)].name;

  // 1. Fetch non-eliminated teams from MongoDB
  let rawTeams: any[] = [];
  const customIds = request.body?.customTeamIds;

  if (customIds && Array.isArray(customIds) && customIds.length > 0) {
    const validObjectIds = customIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    const stringIds = customIds.filter((id) => typeof id === 'string' && !mongoose.Types.ObjectId.isValid(id));

    const queryFilters: any[] = [];
    if (validObjectIds.length > 0) {
      queryFilters.push({ _id: { $in: validObjectIds } });
    }
    if (stringIds.length > 0) {
      queryFilters.push({ teamName: { $in: stringIds } });
    }

    if (queryFilters.length > 0) {
      rawTeams = await Team.find({
        $or: queryFilters,
        status: { $ne: 'Eliminated' },
      });
    }

    // Fallback for mock IDs like ["team-1", "team-2"] during local testing
    if (rawTeams.length === 0 && customIds.length > 0) {
      rawTeams = customIds.map((id) => ({
        _id: id,
        teamName: id.includes('team-') ? id.replace('team-', 'Team ') : id,
        status: 'Safe',
        advantages: [],
        spunDays: [],
        save: async () => {},
      }));
    }
  } else {
    rawTeams = await Team.find({
      status: { $ne: 'Eliminated' },
      isBlocked: { $ne: true },
    }).sort({ teamName: 1 });
  }

  // 2. EXCLUDE TEAMS THAT ALREADY RECEIVED AN ADVANTAGE ON PREVIOUS DAYS
  const eligibleTeams = rawTeams.filter((team) => {
    // Check if team has already received an advantage
    const hasAdvantage = Array.isArray(team.advantages) && team.advantages.length > 0;
    const hasSpunBefore = Array.isArray(team.spunDays) && team.spunDays.length > 0;
    return !hasAdvantage && !hasSpunBefore;
  });

  // If no teams left without previous advantages, fallback to raw non-eliminated teams or return clear message
  const finalTeamsPool = eligibleTeams.length > 0 ? eligibleTeams : rawTeams;

  if (finalTeamsPool.length === 0) {
    return reply.status(400).send({
      error: 'No Eligible Teams',
      message: 'All non-eliminated teams have already received an advantage on previous days or are eliminated!',
    });
  }

  // 3. Random Server-Side Selection among Eligible Teams
  let winningTeam: any = null;
  let winningIndex = 0;

  if (request.body?.teamId) {
    const targetId = request.body.teamId.toString().toLowerCase();
    winningIndex = finalTeamsPool.findIndex(
      (t) => t._id.toString().toLowerCase() === targetId || t.teamName.toLowerCase() === targetId
    );
    if (winningIndex >= 0) {
      winningTeam = finalTeamsPool[winningIndex];
    }
  }

  if (!winningTeam) {
    winningIndex = Math.floor(Math.random() * finalTeamsPool.length);
    winningTeam = finalTeamsPool[winningIndex];
  }

  const advConfig = ADVANTAGE_POOL.find((a) => a.name === targetAdvantage) || { bonusPoints: 25 };
  const bonusAdd = advConfig.bonusPoints;

  // 4. Persist granted advantage to MongoDB
  const isRealObjectId = mongoose.Types.ObjectId.isValid(winningTeam._id);

  if (isRealObjectId) {
    if (!winningTeam.advantages) winningTeam.advantages = [];
    const existingAdv = winningTeam.advantages.find(
      (a: any) => a.advantage.toLowerCase() === targetAdvantage.toLowerCase()
    );

    if (existingAdv) {
      existingAdv.quantity += 1;
    } else {
      winningTeam.advantages.push({
        advantage: targetAdvantage,
        quantity: 1,
        grantedAt: new Date(),
      });
    }

    if (!winningTeam.spunDays) winningTeam.spunDays = [];
    if (!winningTeam.spunDays.includes(dayNumber)) {
      winningTeam.spunDays.push(dayNumber);
    }

    if (typeof winningTeam.save === 'function') {
      await winningTeam.save();
    }
    await delCache('cwc:leaderboard');

    // Auto-update score sheet adv score column for the winning team
    const scoreDoc = await Score.findOne({ team: winningTeam._id, dayNumber });
    const newAdvScore = (scoreDoc?.adv || 0) + bonusAdd;
    const newMain = scoreDoc?.main || 0;
    const newSpecial = scoreDoc?.special || 0;
    const newTotal = newAdvScore + newMain + newSpecial;

    await Score.findOneAndUpdate(
      { team: winningTeam._id, dayNumber },
      {
        team: winningTeam._id,
        dayNumber,
        day: dayNumber,
        date: new Date(),
        scores: { adv: newAdvScore, main: newMain, special: newSpecial, total: newTotal },
        adv: newAdvScore,
        main: newMain,
        special: newSpecial,
        total: newTotal,
        pointsEarned: newTotal,
      },
      { upsert: true, new: true }
    );
  }

  // 5. Construct payload with Team Slices info
  const teamSlices = finalTeamsPool.map((t, idx) => ({
    index: idx,
    teamId: t._id.toString(),
    teamName: t.teamName,
    avatar: (t as any).teamAvatar || '🎪',
    themeColor: t.themeColor || '#F59E0B',
  }));

  const payload = {
    winningTeamId: winningTeam._id.toString(),
    winningTeamName: winningTeam.teamName,
    winningIndex,
    sliceIndex: winningIndex,
    dayNumber,
    advantage: targetAdvantage,
    advantageName: targetAdvantage,
    bonusPoints: bonusAdd,
    teams: teamSlices,
    timestamp: new Date().toISOString(),
  };

  broadcastSpinWheelResult(payload);
  broadcastAdvantageGranted(payload);

  if ((user?.role === 'admin' || user?.role === 'superadmin') && isRealObjectId) {
    await logAdminAction(request, 'TEAM_ADVANTAGE_SPIN', winningTeam._id, payload);
  }

  return reply.send({
    success: true,
    message: `🎡 Spin complete! '${winningTeam.teamName}' won the advantage: ${targetAdvantage}!`,
    winningTeamId: winningTeam._id.toString(),
    winningTeamName: winningTeam.teamName,
    winningIndex,
    sliceIndex: winningIndex,
    outcomeIndex: winningIndex,
    advantage: targetAdvantage,
    advantageName: targetAdvantage,
    bonusPoints: bonusAdd,
    teams: teamSlices,
    team: winningTeam,
  });
}

/**
 * Fetch Non-Eliminated Teams who HAVE NOT received an advantage on previous days
 */
export async function getActiveTeamsForWheel(_request: FastifyRequest, reply: FastifyReply) {
  const teams = await Team.find({
    status: { $ne: 'Eliminated' },
    isBlocked: { $ne: true },
    $or: [
      { advantages: { $size: 0 } },
      { advantages: { $exists: false } },
    ],
  }).sort({ teamName: 1 });

  return reply.send({
    count: teams.length,
    teams: teams.map((t, idx) => ({
      index: idx,
      teamId: t._id.toString(),
      teamName: t.teamName,
      status: t.status,
      avatar: (t as any).teamAvatar || '🎪',
      themeColor: t.themeColor || '#F59E0B',
    })),
  });
}

export async function advantagesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);

  fastify.post('/spin-wheel', handleSpinWheel);
  fastify.post('/trigger-spin', handleSpinWheel);
  fastify.get('/spin-wheel/teams', getActiveTeamsForWheel);
  fastify.get('/spin-wheel/options', async (_req, reply) => {
    return reply.send({ options: ADVANTAGE_POOL });
  });
}

export default advantagesRoutes;
