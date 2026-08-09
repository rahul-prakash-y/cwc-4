import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import { Team } from '../models/Team.js';
import { Score } from '../models/Score.js';
import { DailySpinWheel } from '../models/DailySpinWheel.js';
import { delCache } from '../utils/redis.js';
import { verifyJWT, isAdmin } from '../middleware/auth.js';
import { broadcastSpinWheelResult, broadcastAdvantageGranted, getSocketIoInstance } from '../socket.js';
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

function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

/**
 * Admin API: Approve a specific team for Today's Spin Wheel (1 Team per Day Rule)
 */
export async function approveTeamForSpin(
  request: FastifyRequest<{
    Body: {
      teamId: string;
      dayNumber?: number;
    };
  }>,
  reply: FastifyReply
) {
  const user = (request as any).user;
  const { teamId, dayNumber = 1 } = request.body || {};
  const todayDate = getTodayDateString();

  if (!teamId) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Team ID is required' });
  }

  let team = null;
  if (mongoose.Types.ObjectId.isValid(teamId)) {
    team = await Team.findById(teamId);
  }
  if (!team) {
    team = await Team.findOne({ teamName: teamId });
  }

  if (!team) {
    return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
  }

  if (team.status === 'Eliminated') {
    return reply.status(400).send({ error: 'Invalid Team', message: 'Eliminated teams cannot be approved for spin wheel!' });
  }

  let dailyRecord = await DailySpinWheel.findOne({
    $or: [{ date: todayDate }, { dayNumber }],
  });

  if (!dailyRecord) {
    dailyRecord = new DailySpinWheel({
      date: todayDate,
      dayNumber,
      approvedTeamId: team._id,
      approvedTeamName: team.teamName,
      isSpun: false,
      approvedBy: user?.email || 'Admin',
      approvedAt: new Date(),
    });
  } else {
    dailyRecord.approvedTeamId = team._id;
    dailyRecord.approvedTeamName = team.teamName;
    dailyRecord.isSpun = false;
    dailyRecord.approvedBy = user?.email || 'Admin';
    dailyRecord.approvedAt = new Date();
  }

  await dailyRecord.save();

  // Broadcast WebSocket event to update clients live
  const io = getSocketIoInstance();
  if (io) {
    io.emit('spin-wheel:approved', {
      todayDate,
      dayNumber,
      approvedTeamId: team._id.toString(),
      approvedTeamName: team.teamName,
      timestamp: new Date().toISOString(),
    });
  }

  await logAdminAction(request, 'SPIN_WHEEL_TEAM_APPROVED', team._id, {
    approvedTeamName: team.teamName,
    dayNumber,
    todayDate,
  });

  return reply.send({
    success: true,
    message: `Team '${team.teamName}' has been approved by Admin for today's Spin Wheel! 🎡`,
    dailySpin: {
      todayDate,
      dayNumber,
      approvedTeamId: team._id.toString(),
      approvedTeamName: team.teamName,
      isSpun: false,
    },
  });
}

/**
 * Get current Spin Wheel Status for today
 */
export async function getSpinWheelStatus(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  const todayDate = getTodayDateString();

  let userTeamId: string | null = null;
  let userTeamName: string | null = null;

  if (user) {
    if (user.teamId) {
      userTeamId = user.teamId.toString();
    } else if (user.email) {
      const userTeam = await Team.findOne({
        $or: [
          { 'leader.email': user.email.toLowerCase() },
          { 'members.deptMailId': user.email.toLowerCase() },
          { 'members.email': user.email.toLowerCase() },
        ],
      });
      if (userTeam) {
        userTeamId = userTeam._id.toString();
        userTeamName = userTeam.teamName;
      }
    }
  }

  const dailyRecord = await DailySpinWheel.findOne({
    $or: [{ date: todayDate }, { dayNumber: 1 }],
  }).sort({ updatedAt: -1 });

  const approvedTeamIdStr = dailyRecord?.approvedTeamId ? dailyRecord.approvedTeamId.toString() : null;
  const isApprovedForUserTeam = Boolean(userTeamId && approvedTeamIdStr && userTeamId === approvedTeamIdStr);

  return reply.send({
    todayDate,
    dayNumber: dailyRecord?.dayNumber || 1,
    approvedTeamId: approvedTeamIdStr,
    approvedTeamName: dailyRecord?.approvedTeamName || null,
    isSpun: Boolean(dailyRecord?.isSpun),
    advantageWon: dailyRecord?.advantageWon || null,
    isApprovedForUserTeam,
    userTeamId,
    userTeamName,
  });
}

/**
 * Execute Spin Wheel (Rule: Only approved team for the day can spin!)
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
  const isAdminUser = user?.role === 'admin' || user?.role === 'superadmin';
  const dayNumber = Number(request.body?.dayNumber || 1);
  const todayDate = getTodayDateString();

  // Find Today's Daily Spin Approval record
  const dailyRecord = await DailySpinWheel.findOne({
    $or: [{ date: todayDate }, { dayNumber }],
  }).sort({ updatedAt: -1 });

  if (!dailyRecord || !dailyRecord.approvedTeamId) {
    return reply.status(400).send({
      error: 'Approval Required',
      message: 'No team has been approved by Admin to spin the wheel today! Admin must select a team first.',
    });
  }

  if (dailyRecord.isSpun) {
    return reply.status(400).send({
      error: 'Already Spun',
      message: `Today's spin wheel has already been completed by '${dailyRecord.approvedTeamName}'! Advantage won: ${dailyRecord.advantageWon || 'Granted'}.`,
    });
  }

  // If not admin, check if user belongs to the approved team
  if (!isAdminUser) {
    let userTeam = null;
    if (user?.teamId) {
      userTeam = await Team.findById(user.teamId);
    } else if (user?.email) {
      userTeam = await Team.findOne({
        $or: [
          { 'leader.email': user.email.toLowerCase() },
          { 'members.deptMailId': user.email.toLowerCase() },
          { 'members.email': user.email.toLowerCase() },
        ],
      });
    }

    if (!userTeam || userTeam._id.toString() !== dailyRecord.approvedTeamId.toString()) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: `Admin approval required! Only '${dailyRecord.approvedTeamName}' has been selected by Admin to spin the wheel today.`,
      });
    }
  }

  // Fetch approved winning team document
  const winningTeam = await Team.findById(dailyRecord.approvedTeamId);
  if (!winningTeam) {
    return reply.status(404).send({ error: 'Not Found', message: 'Approved team record not found!' });
  }

  // Target Advantage Selection
  const targetAdvantage =
    request.body?.advantageName || ADVANTAGE_POOL[Math.floor(Math.random() * ADVANTAGE_POOL.length)].name;
  const advConfig = ADVANTAGE_POOL.find((a) => a.name === targetAdvantage) || { bonusPoints: 25 };
  const bonusAdd = advConfig.bonusPoints;

  // Persist advantage to winning team
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

  await winningTeam.save();
  await delCache('cwc:leaderboard');

  // Update Score Sheet
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

  // Mark DailySpinWheel record as SPUN
  dailyRecord.isSpun = true;
  dailyRecord.advantageWon = targetAdvantage;
  dailyRecord.bonusPoints = bonusAdd;
  dailyRecord.spunAt = new Date();
  await dailyRecord.save();

  const payload = {
    winningTeamId: winningTeam._id.toString(),
    winningTeamName: winningTeam.teamName,
    winningIndex: 0,
    dayNumber,
    advantage: targetAdvantage,
    advantageName: targetAdvantage,
    bonusPoints: bonusAdd,
    timestamp: new Date().toISOString(),
  };

  broadcastSpinWheelResult(payload);
  broadcastAdvantageGranted(payload);

  if (isAdminUser) {
    await logAdminAction(request, 'TEAM_ADVANTAGE_SPIN', winningTeam._id, payload);
  }

  return reply.send({
    success: true,
    message: `🎡 Spin complete! '${winningTeam.teamName}' won the advantage: ${targetAdvantage}!`,
    winningTeamId: winningTeam._id.toString(),
    winningTeamName: winningTeam.teamName,
    winningIndex: 0,
    advantage: targetAdvantage,
    advantageName: targetAdvantage,
    bonusPoints: bonusAdd,
    team: winningTeam,
  });
}

/**
 * Fetch Non-Eliminated Teams
 */
export async function getActiveTeamsForWheel(_request: FastifyRequest, reply: FastifyReply) {
  const teams = await Team.find({
    status: { $ne: 'Eliminated' },
    isBlocked: { $ne: true },
  }).sort({ teamName: 1 });

  const todayDate = getTodayDateString();
  const dailyRecord = await DailySpinWheel.findOne({
    $or: [{ date: todayDate }, { dayNumber: 1 }],
  }).sort({ updatedAt: -1 });

  return reply.send({
    count: teams.length,
    approvedTeamId: dailyRecord?.approvedTeamId ? dailyRecord.approvedTeamId.toString() : null,
    approvedTeamName: dailyRecord?.approvedTeamName || null,
    isSpun: Boolean(dailyRecord?.isSpun),
    teams: teams.map((t, idx) => ({
      index: idx,
      teamId: t._id.toString(),
      teamName: t.teamName,
      status: t.status,
      avatar: (t as any).teamAvatar || '🎪',
      themeColor: t.themeColor || '#F59E0B',
      isApproved: dailyRecord?.approvedTeamId ? dailyRecord.approvedTeamId.toString() === t._id.toString() : false,
    })),
  });
}

export async function advantagesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyJWT);

  // Student & Admin status & spin routes
  fastify.get('/spin-wheel/status', getSpinWheelStatus);
  fastify.get('/spin-wheel/teams', getActiveTeamsForWheel);
  fastify.get('/spin-wheel/options', async (_req, reply) => {
    return reply.send({ options: ADVANTAGE_POOL });
  });

  fastify.post('/spin-wheel', handleSpinWheel);
  fastify.post('/trigger-spin', handleSpinWheel);

  // Admin approval route (requires Admin role)
  fastify.post('/spin-wheel/approve', { preHandler: [isAdmin] }, approveTeamForSpin as any);
}

export default advantagesRoutes;
