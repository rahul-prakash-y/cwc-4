import { FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import { Team } from '../models/Team.js';
import { Task, TaskType } from '../models/Task.js';
import { Announcement } from '../models/Announcement.js';
import { Score } from '../models/Score.js';
import { Setting } from '../models/Setting.js';
import { delCache } from '../utils/redis.js';

/* ==========================================================================
   GRAND FINALE GLOBAL TOGGLE CONTROLLERS
   ========================================================================== */

export async function getGrandFinale(_request: FastifyRequest, reply: FastifyReply) {
  let settingDoc = await Setting.findOne({ key: 'isGrandFinale' });
  if (!settingDoc) {
    settingDoc = await Setting.create({ key: 'isGrandFinale', value: false });
  }
  return reply.send({
    isGrandFinale: Boolean(settingDoc.value),
  });
}

export async function toggleGrandFinale(
  request: FastifyRequest<{ Body: { isGrandFinale?: boolean } }>,
  reply: FastifyReply
) {
  let settingDoc = await Setting.findOne({ key: 'isGrandFinale' });
  const newValue =
    request.body?.isGrandFinale !== undefined
      ? Boolean(request.body.isGrandFinale)
      : !Boolean(settingDoc?.value);

  settingDoc = await Setting.findOneAndUpdate(
    { key: 'isGrandFinale' },
    { value: newValue },
    { upsert: true, new: true }
  );

  return reply.send({
    message: `Grand Finale Mode is now ${newValue ? '🏆 ACTIVE (GOLD THEME)' : '🎪 STANDARD CARNIVAL'}`,
    isGrandFinale: Boolean(settingDoc?.value),
  });
}

/* ==========================================================================
   TEAM MANAGEMENT CONTROLLERS
   ========================================================================== */


export async function getAllTeams(_request: FastifyRequest, reply: FastifyReply) {
  const teams = await Team.find().lean();

  // Aggregate scores for each team
  const teamsWithScores = await Promise.all(
    teams.map(async (team) => {
      const scores = await Score.find({ team: team._id });
      const totalPoints = scores.reduce((acc, curr) => acc + (curr.pointsEarned || 0), 0);
      return {
        ...team,
        totalPoints,
      };
    })
  );

  return reply.send({
    teams: teamsWithScores,
    count: teamsWithScores.length,
  });
}

export async function updateTeamStatus(
  request: FastifyRequest<{
    Params: { teamId: string };
    Body: { status: 'Pending' | 'Approved' | 'Eliminated' };
  }>,
  reply: FastifyReply
) {
  const { teamId } = request.params;
  const { status } = request.body;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Invalid Team ID' });
  }

  if (!['Pending', 'Approved', 'Eliminated'].includes(status)) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Invalid status. Allowed values: Pending, Approved, Eliminated',
    });
  }

  const team = await Team.findByIdAndUpdate(
    teamId,
    { status },
    { new: true, runValidators: true }
  );

  if (!team) {
    return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
  }

  return reply.send({
    message: `Team status updated to ${status} successfully! 🎪`,
    team,
  });
}

export async function eliminateTeam(
  request: FastifyRequest<{ Params: { teamId: string } }>,
  reply: FastifyReply
) {
  const { teamId } = request.params;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Invalid Team ID' });
  }

  const team = await Team.findByIdAndUpdate(
    teamId,
    { status: 'Eliminated' },
    { new: true }
  );

  if (!team) {
    return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
  }

  return reply.send({
    message: `Team '${team.teamName}' has been eliminated.`,
    team,
  });
}

/* ==========================================================================
   TASK MANAGEMENT CONTROLLERS
   ========================================================================== */

interface CreateTaskBody {
  title: string;
  description?: string;
  type: TaskType;
  points: number;
  startTime: string | Date;
  endTime: string | Date;
  visibility?: boolean;
}

export async function createTask(
  request: FastifyRequest<{ Body: CreateTaskBody }>,
  reply: FastifyReply
) {
  const { title, description, type, points, startTime, endTime, visibility = false } = request.body;

  if (!title || !type || points === undefined || !startTime || !endTime) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Missing required fields for task creation',
    });
  }

  const newTask = await Task.create({
    title,
    description: description || '',
    type,
    points,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    visibility,
  });

  return reply.status(201).send({
    message: 'Task created successfully! 🎯',
    task: newTask,
  });
}

export async function getAllTasksAdmin(_request: FastifyRequest, reply: FastifyReply) {
  const tasks = await Task.find().sort({ startTime: 1 });
  return reply.send({ tasks });
}

export async function updateTask(
  request: FastifyRequest<{ Params: { taskId: string }; Body: Partial<CreateTaskBody> }>,
  reply: FastifyReply
) {
  const { taskId } = request.params;
  const updateData = request.body;

  if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
  if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);

  const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedTask) {
    return reply.status(404).send({ error: 'Not Found', message: 'Task not found' });
  }

  return reply.send({
    message: 'Task updated successfully! 🎯',
    task: updatedTask,
  });
}

export async function deleteTask(
  request: FastifyRequest<{ Params: { taskId: string } }>,
  reply: FastifyReply
) {
  const { taskId } = request.params;
  const deletedTask = await Task.findByIdAndDelete(taskId);

  if (!deletedTask) {
    return reply.status(404).send({ error: 'Not Found', message: 'Task not found' });
  }

  return reply.send({
    message: 'Task deleted successfully.',
    taskId,
  });
}

/* ==========================================================================
   GLOBAL ANNOUNCEMENT CONTROLLERS
   ========================================================================== */

interface CreateAnnouncementBody {
  message: string;
  pinned?: boolean;
  author?: string;
}

export async function createAnnouncement(
  request: FastifyRequest<{ Body: CreateAnnouncementBody }>,
  reply: FastifyReply
) {
  const { message, pinned = false, author } = request.body;

  if (!message) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Announcement message is required',
    });
  }

  const announcement = await Announcement.create({
    message,
    pinned,
    author: author || 'Carnival Admin 🎪',
    timestamp: new Date(),
  });

  await delCache('cwc:announcements');

  return reply.status(201).send({
    message: 'Global announcement posted! 📢',
    announcement,
  });
}

export async function getAllAnnouncementsAdmin(_request: FastifyRequest, reply: FastifyReply) {
  const announcements = await Announcement.find().sort({ pinned: -1, createdAt: -1 });
  return reply.send({ announcements });
}

export async function deleteAnnouncement(
  request: FastifyRequest<{ Params: { announcementId: string } }>,
  reply: FastifyReply
) {
  const { announcementId } = request.params;
  const deleted = await Announcement.findByIdAndDelete(announcementId);

  if (!deleted) {
    return reply.status(404).send({ error: 'Not Found', message: 'Announcement not found' });
  }

  await delCache('cwc:announcements');

  return reply.send({
    message: 'Announcement deleted successfully.',
    announcementId,
  });
}

/* ==========================================================================
   ADVANTAGES & IMMUNITIES CONTROLLERS
   ========================================================================== */

interface GrantAdvantageBody {
  advantage: 'Double Points' | 'Extra Time' | 'Skip' | 'Golden Coin' | 'Hint' | string;
  quantity?: number;
}

export async function grantAdvantage(
  request: FastifyRequest<{
    Params: { teamId: string };
    Body: GrantAdvantageBody;
  }>,
  reply: FastifyReply
) {
  const { teamId } = request.params;
  const { advantage, quantity = 1 } = request.body;

  if (!advantage) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Advantage name is required (e.g. Double Points, Extra Time, Skip, Golden Coin, Hint)',
    });
  }

  const session = await mongoose.startSession();
  let transactionStarted = false;
  try {
    try {
      session.startTransaction();
      transactionStarted = true;
    } catch {
      // Standalone MongoDB fallback without replica set
    }

    const sessionOption = transactionStarted ? { session } : {};

    const team = await Team.findById(teamId, null, sessionOption);
    if (!team) {
      if (transactionStarted) await session.abortTransaction();
      return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
    }

    const existingAdv = team.advantages.find(
      (a) => a.advantage.toLowerCase() === advantage.toLowerCase()
    );

    if (existingAdv) {
      existingAdv.quantity += quantity;
    } else {
      team.advantages.push({
        advantage,
        quantity,
        grantedAt: new Date(),
      });
    }

    await team.save(sessionOption);

    if (transactionStarted) {
      await session.commitTransaction();
    }

    await delCache('cwc:leaderboard');

    return reply.send({
      message: `Granted advantage '${advantage}' (+${quantity}) to team '${team.teamName}'! 🎁`,
      team,
    });
  } catch (error) {
    if (transactionStarted) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
}

interface SetImmunityBody {
  immunity: boolean;
}

export async function setTeamImmunity(
  request: FastifyRequest<{
    Params: { teamId: string };
    Body: SetImmunityBody;
  }>,
  reply: FastifyReply
) {
  const { teamId } = request.params;
  const { immunity } = request.body;

  if (typeof immunity !== 'boolean') {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Immunity status (boolean true/false) is required',
    });
  }

  const team = await Team.findByIdAndUpdate(
    teamId,
    { immunity },
    { new: true }
  );

  if (!team) {
    return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
  }

  return reply.send({
    message: `Immunity status for team '${team.teamName}' set to: ${immunity ? '🛡️ PROTECTED' : '❌ NONE'}`,
    team,
  });
}

/* ==========================================================================
   SCORE SHEET BATCH CONTROLLER
   ========================================================================== */

export interface ScoreBatchItem {
  teamId: string;
  mainTaskScore: number;
  specialTaskScore: number;
  advantage?: string;
  immunity?: boolean;
  elimination?: boolean;
  status?: 'Safe' | 'Danger' | 'Eliminated' | 'Approved' | 'Pending';
  totalPoints?: number;
}

export async function updateScoresBatch(
  request: FastifyRequest<{ Body: { scores: ScoreBatchItem[] } }>,
  reply: FastifyReply
) {
  const { scores } = request.body;

  if (!Array.isArray(scores)) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Scores must be an array of team score objects',
    });
  }

  const results = await Promise.all(
    scores.map(async (item) => {
      const updateData: any = {};
      if (item.status) updateData.status = item.status;
      if (item.immunity !== undefined) updateData.immunity = item.immunity;
      if (item.elimination) updateData.status = 'Eliminated';

      if (Object.keys(updateData).length > 0) {
        await Team.findByIdAndUpdate(item.teamId, updateData);
      }

      let taskDoc = await Task.findOne({ type: 'Main Task' });
      if (!taskDoc) {
        taskDoc = await Task.findOne();
      }

      if (taskDoc && item.teamId) {
        const totalPoints = (item.mainTaskScore || 0) + (item.specialTaskScore || 0);
        await Score.findOneAndUpdate(
          { team: item.teamId, task: taskDoc._id },
          {
            pointsEarned: totalPoints,
            advantagesUsed: item.advantage ? [item.advantage] : [],
            immunityStatus: item.immunity || false,
          },
          { upsert: true, new: true }
        );
      }

      return { teamId: item.teamId, success: true };
    })
  );

  await delCache('cwc:leaderboard');

  return reply.send({
    message: 'Batch score sheet updated successfully! 📊',
    updatedCount: results.length,
    results,
  });
}

