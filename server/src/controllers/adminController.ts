import { FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import { Team } from '../models/Team.js';
import { Task, TaskType } from '../models/Task.js';
import { Announcement } from '../models/Announcement.js';
import { Score } from '../models/Score.js';
import { Setting } from '../models/Setting.js';
import { delCache } from '../utils/redis.js';
import {
  broadcastScoreUpdated,
  broadcastNewAnnouncement,
  broadcastStatusChanged,
} from '../socket.js';
import { sendEmail, sendBackgroundEmailBatch } from '../utils/mailer.js';
import {
  getDailyTaskEmailHtml,
  getAdvantageGrantedEmailHtml,
  getStatusAlertEmailHtml,
  getAnnouncementEmailHtml,
} from '../utils/emailTemplates.js';

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


export async function getAllTeams(
  request: FastifyRequest<{
    Querystring: { search?: string; status?: string; residenceType?: string };
  }>,
  reply: FastifyReply
) {
  const { search, status, residenceType } = request.query || {};
  const query: any = {};

  if (status) {
    query.status = status;
  }

  if (residenceType) {
    query.residenceType = residenceType;
  }

  if (search) {
    const searchRegex = new RegExp(search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
    query.$or = [
      { teamName: searchRegex },
      { 'leader.name': searchRegex },
      { 'leader.email': searchRegex },
      { 'members.name': searchRegex },
      { 'members.email': searchRegex },
    ];
  }

  const teams = await Team.find(query).lean();

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


import { EventEmitter } from 'events';

export const teamBroadcaster = new EventEmitter();
teamBroadcaster.setMaxListeners(100);

export async function streamTeamStatusEvents(_request: FastifyRequest, reply: FastifyReply) {
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.raw.setHeader('Access-Control-Allow-Origin', '*');

  const onStatusChange = (data: any) => {
    reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  teamBroadcaster.on('status-changed', onStatusChange);

  _request.raw.on('close', () => {
    teamBroadcaster.off('status-changed', onStatusChange);
  });
}

export async function updateTeamStatus(
  request: FastifyRequest<{
    Params: { teamId?: string; id?: string };
    Body: { status: 'Pending' | 'Approved' | 'Rejected' | 'Eliminated' | 'Safe' | 'Danger' | 'Qualified' };
  }>,
  reply: FastifyReply
) {
  const teamId = request.params.teamId || request.params.id;
  const { status } = request.body;

  if (!teamId) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Team ID parameter is required' });
  }

  const validStatuses = ['Pending', 'Approved', 'Rejected', 'Eliminated', 'Safe', 'Danger', 'Qualified'];
  if (!validStatuses.includes(status)) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
    });
  }

  let team = null;
  if (mongoose.Types.ObjectId.isValid(teamId)) {
    team = await Team.findByIdAndUpdate(teamId, { status }, { new: true, runValidators: true });
  }
  if (!team) {
    team = await Team.findOneAndUpdate({ teamName: teamId }, { status }, { new: true, runValidators: true });
  }


  if (!team) {
    return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
  }

  // Broadcast status change to connected frontend clients
  teamBroadcaster.emit('status-changed', {
    teamId: team._id.toString(),
    teamName: team.teamName,
    status: team.status,
    timestamp: new Date().toISOString(),
  });
  broadcastStatusChanged({
    teamId: team._id.toString(),
    teamName: team.teamName,
    status: team.status,
    timestamp: new Date().toISOString(),
  });

  await delCache('cwc:leaderboard');

  // Asynchronously dispatch Status Alert Email to Team Leader
  if (team.leader?.email) {
    setImmediate(() => {
      const html = getStatusAlertEmailHtml({
        teamName: team.teamName,
        status: team.status,
      });
      sendEmail({
        to: team.leader.email,
        subject: `🎪 Team Status Update: ${team.status} - ${team.teamName}`,
        html,
      });
    });
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

  let team = null;
  if (mongoose.Types.ObjectId.isValid(teamId)) {
    team = await Team.findByIdAndUpdate(teamId, { status: 'Eliminated' }, { new: true });
  }
  if (!team) {
    team = await Team.findOneAndUpdate({ teamName: teamId }, { status: 'Eliminated' }, { new: true });
  }

  if (!team) {
    return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
  }

  teamBroadcaster.emit('status-changed', {
    teamId: team._id.toString(),
    teamName: team.teamName,
    status: 'Eliminated',
    timestamp: new Date().toISOString(),
  });
  broadcastStatusChanged({
    teamId: team._id.toString(),
    teamName: team.teamName,
    status: 'Eliminated',
    timestamp: new Date().toISOString(),
  });

  await delCache('cwc:leaderboard');

  // Asynchronously dispatch Elimination Email Alert
  if (team.leader?.email) {
    setImmediate(() => {
      const html = getStatusAlertEmailHtml({
        teamName: team.teamName,
        status: 'Eliminated',
      });
      sendEmail({
        to: team.leader.email,
        subject: `🚨 Urgent: Elimination Status Alert - Team ${team.teamName}`,
        html,
      });
    });
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

  // Asynchronously broadcast Daily Task Live Alert Email to all registered Team Leaders
  setImmediate(async () => {
    try {
      const teams = await Team.find({ 'leader.email': { $exists: true } });
      const recipients = Array.from(
        new Set(teams.map((t) => t.leader?.email).filter((e): e is string => Boolean(e)))
      );
      if (recipients.length > 0) {
        const html = getDailyTaskEmailHtml({
          taskTitle: newTask.title,
          taskType: newTask.type,
          points: newTask.points,
          description: newTask.description,
          startTime: newTask.startTime,
          endTime: newTask.endTime,
        });
        sendBackgroundEmailBatch({
          recipients,
          subject: `🎯 Daily Task Alert: ${newTask.title} (+${newTask.points} PTS)`,
          html,
        });
      }
    } catch (err) {
      console.error('Failed to broadcast daily task email alert:', err);
    }
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
  sendEmailAlert?: boolean;
}

export async function createAnnouncement(
  request: FastifyRequest<{ Body: CreateAnnouncementBody }>,
  reply: FastifyReply
) {
  const { message, pinned = false, author, sendEmailAlert = false } = request.body;

  if (!message) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Announcement message is required',
    });
  }

  const announcementAuthor = author || 'Carnival Admin 🎪';

  const announcement = await Announcement.create({
    message,
    pinned,
    author: announcementAuthor,
    timestamp: new Date(),
  });

  await delCache('cwc:announcements');

  // Broadcast WebSocket event for NEW_ANNOUNCEMENT
  broadcastNewAnnouncement({
    announcement,
    message: announcement.message,
    pinned: announcement.pinned,
    author: announcement.author,
    timestamp: announcement.timestamp,
  });

  // Task 3: Trigger background email broadcast if sendEmailAlert is checked
  if (sendEmailAlert) {
    setImmediate(async () => {
      try {
        const teams = await Team.find({ 'leader.email': { $exists: true } });
        const recipients = Array.from(
          new Set(teams.map((t) => t.leader?.email).filter((e): e is string => Boolean(e)))
        );

        if (recipients.length > 0) {
          const html = getAnnouncementEmailHtml({
            announcementMessage: message,
            author: announcementAuthor,
            timestamp: announcement.timestamp,
          });

          sendBackgroundEmailBatch({
            recipients,
            subject: `📢 CWC Season 4 Announcement: ${message.slice(0, 50)}${message.length > 50 ? '...' : ''}`,
            html,
          });
        }
      } catch (err) {
        console.error('Failed to trigger announcement background email alert:', err);
      }
    });
  }

  return reply.status(201).send({
    message: sendEmailAlert
      ? 'Global announcement posted & background email alerts dispatched! 📢📧'
      : 'Global announcement posted! 📢',
    announcement,
    emailAlertTriggered: Boolean(sendEmailAlert),
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
  teamId?: string;
  advantage?: 'Double Points' | 'Extra Time' | 'Skip' | 'Golden Coin' | 'Hint' | string;
  quantity?: number;
  immunity?: boolean;
}

export async function grantAdvantage(
  request: FastifyRequest<{
    Params: { teamId?: string; id?: string };
    Body: GrantAdvantageBody;
  }>,
  reply: FastifyReply
) {
  const teamId = request.params.teamId || request.params.id || request.body?.teamId;
  const { advantage, quantity = 1, immunity } = request.body || {};

  if (!teamId) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Team ID is required in URL parameter or request body',
    });
  }

  if (!advantage && immunity === undefined) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Advantage name or immunity setting is required (e.g. Double Points, Extra Time, Skip, Golden Coin, Hint)',
    });
  }

  const effectiveAdvantage = advantage || (immunity ? 'Immunity' : 'Double Points');

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

    let team = null;
    if (mongoose.Types.ObjectId.isValid(teamId)) {
      team = await Team.findById(teamId, null, sessionOption);
    }
    if (!team) {
      team = await Team.findOne({
        $or: [
          { teamName: teamId },
          { teamName: { $regex: new RegExp(teamId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i') } },
        ],
      }, null, sessionOption);
    }

    if (!team) {
      if (transactionStarted) await session.abortTransaction();
      return reply.status(404).send({ error: 'Not Found', message: `Team '${teamId}' not found` });
    }

    if (immunity !== undefined) {
      team.immunity = Boolean(immunity);
    }
    if (effectiveAdvantage.toLowerCase().includes('immunity')) {
      team.immunity = true;
    }

    if (advantage || !immunity) {
      const existingAdv = team.advantages.find(
        (a) => a.advantage.toLowerCase() === effectiveAdvantage.toLowerCase()
      );

      if (existingAdv) {
        existingAdv.quantity += quantity;
      } else {
        team.advantages.push({
          advantage: effectiveAdvantage,
          quantity,
          grantedAt: new Date(),
        });
      }
    }


    await team.save(sessionOption);

    if (transactionStarted) {
      await session.commitTransaction();
    }

    await delCache('cwc:leaderboard');

    // Broadcast WebSocket event for advantage grant
    broadcastStatusChanged({
      teamId: team._id.toString(),
      teamName: team.teamName,
      advantage,
      quantity,
      advantages: team.advantages,
      immunity: team.immunity,
    });
    broadcastScoreUpdated({
      teamId: team._id.toString(),
      teamName: team.teamName,
      type: 'ADVANTAGE_GRANTED',
    });

    // Asynchronously send Advantage Granted Email Alert to Team Leader
    if (team.leader?.email) {
      const leaderEmail = team.leader.email;
      const teamName = team.teamName;
      const immunity = team.immunity;
      setImmediate(() => {
        const html = getAdvantageGrantedEmailHtml({
          teamName,
          advantage: effectiveAdvantage,
          quantity,
          immunity,
        });
        sendEmail({
          to: leaderEmail,
          subject: `🎁 Power-Up Granted: ${effectiveAdvantage} - Team ${teamName}`,
          html,
        });

      });
    }

    return reply.send({
      message: `Granted advantage '${effectiveAdvantage}' (+${quantity}) to team '${team.teamName}'! 🎁`,
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

  // Broadcast WebSocket event for immunity change
  broadcastStatusChanged({
    teamId: team._id.toString(),
    teamName: team.teamName,
    immunity: team.immunity,
  });
  broadcastScoreUpdated({
    teamId: team._id.toString(),
    teamName: team.teamName,
    type: 'IMMUNITY_CHANGED',
  });

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

  // Broadcast WebSocket event for SCORE_UPDATED
  broadcastScoreUpdated({
    scores: results,
    updatedCount: results.length,
  });

  return reply.send({
    message: 'Batch score sheet updated successfully! 📊',
    updatedCount: results.length,
    results,
  });
}

