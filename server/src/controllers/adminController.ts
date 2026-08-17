import { FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { Task, TaskType } from '../models/Task.js';
import { Announcement } from '../models/Announcement.js';
import { Score } from '../models/Score.js';
import { Setting } from '../models/Setting.js';
import { Settings } from '../models/Settings.js';
import { BuzzerQuestion } from '../models/BuzzerQuestion.js';
import { DailyVoteLog } from '../models/VoteLog.js';
import { Submission } from '../models/Submission.js';
import { delCache } from '../utils/redis.js';
import { logAdminAction } from '../utils/auditLogger.js';
import {
  broadcastScoreUpdated,
  broadcastNewAnnouncement,
  broadcastStatusChanged,
  broadcastAdvantageGranted,
  broadcastFinaleTriggered,
  broadcastVotesUpdated,
} from '../socket.js';
import { sendEmail, sendCarnivalEmail, sendBackgroundEmailBatch } from '../utils/mailer.js';
import {
  getDailyTaskEmailHtml,
  getAdvantageGrantedEmailHtml,
  getStatusAlertEmailHtml,
  getAnnouncementEmailHtml,
} from '../utils/emailTemplates.js';

/* ==========================================================================
   ADMIN OVERVIEW TELEMETRY & STATS CONTROLLER (DB DRIVEN)
   ========================================================================== */

export async function getOverviewStats(_request: FastifyRequest, reply: FastifyReply) {
  try {
    // 1. Teams statistics
    const totalTeams = await Team.countDocuments();
    const qualifiedTeams = await Team.countDocuments({
      status: { $in: ['Qualified', 'Safe', 'Approved'] },
    });
    const eliminatedTeams = await Team.countDocuments({ status: 'Eliminated' });

    // Calculate total participants (leaders + members count)
    const teamsList = await Team.find().select('members leader').lean();
    let totalParticipants = 0;
    teamsList.forEach((t: any) => {
      let count = 0;
      if (t.leader) count += 1;
      if (Array.isArray(t.members)) count += t.members.length;
      totalParticipants += count;
    });

    // 2. Submissions statistics
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaySubmissions = await Submission.countDocuments({ submittedAt: { $gte: startOfToday } });
    const totalSubmissions = await Submission.countDocuments();
    const evaluatedSubmissions = await Submission.countDocuments({ status: 'Evaluated' });

    let evaluationPercentage = 100;
    if (totalSubmissions > 0) {
      evaluationPercentage = Math.round((evaluatedSubmissions / totalSubmissions) * 100);
    }

    // 3. Daily Progression Chart Data
    const topTeams = await Team.find()
      .select('teamName themeColor')
      .limit(6)
      .lean();

    const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'];
    const curatedColors = ['#FFD700', '#FF0055', '#00F0FF', '#8A2BE2', '#10B981', '#F59E0B'];

    // Fetch scores grouped by team and dayNumber
    const allScores = await Score.find().lean();

    // Map: teamId -> dayNumber -> score
    const teamScoreMap: Record<string, Record<number, number>> = {};
    allScores.forEach((s: any) => {
      const tId = s.team?.toString();
      if (!tId) return;
      if (!teamScoreMap[tId]) teamScoreMap[tId] = {};
      const dayNum = s.dayNumber || s.day || 1;
      const pts = s.pointsEarned ?? s.total ?? s.scores?.total ?? 0;
      teamScoreMap[tId][dayNum] = pts;
    });

    const datasets = topTeams.map((team: any, idx: number) => {
      const color = team.themeColor || curatedColors[idx % curatedColors.length];
      const tId = team._id.toString();

      let runningTotal = 0;
      const dataPoints = Array.from({ length: 10 }, (_, i) => {
        const dayNum = i + 1;
        const dayPts = teamScoreMap[tId]?.[dayNum] || 0;
        runningTotal += dayPts;
        return runningTotal;
      });

      return {
        label: team.teamName,
        data: dataPoints,
        borderColor: color,
        backgroundColor: `${color}20`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: '#0B0A16',
        pointHoverRadius: 7,
      };
    });

    return reply.send({
      cards: {
        totalTeams,
        totalParticipants,
        qualifiedTeams,
        eliminatedTeams,
        todaySubmissions,
        totalSubmissions,
        evaluatedSubmissions,
        evaluationPercentage,
      },
      progressionChart: {
        labels: days,
        datasets,
      },
    });
  } catch (error: any) {
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch overview telemetry.',
    });
  }
}

/* ==========================================================================
   GRAND FINALE GLOBAL TOGGLE CONTROLLERS
   ========================================================================== */

export async function getGrandFinale(_request: FastifyRequest, reply: FastifyReply) {
  let settingsDoc = await Settings.findOne();
  if (!settingsDoc) {
    settingsDoc = await Settings.create({ isGrandFinale: false });
  }
  let settingDoc = await Setting.findOne({ key: 'isGrandFinale' });
  if (!settingDoc) {
    settingDoc = await Setting.create({ key: 'isGrandFinale', value: settingsDoc.isGrandFinale });
  }
  return reply.send({
    isGrandFinale: Boolean(settingsDoc.isGrandFinale),
  });
}

export async function toggleGrandFinale(
  request: FastifyRequest<{ Body: { isGrandFinale?: boolean } }>,
  reply: FastifyReply
) {
  let settingsDoc = await Settings.findOne();
  if (!settingsDoc) {
    settingsDoc = await Settings.create({ isGrandFinale: false });
  }

  const newValue =
    request.body?.isGrandFinale !== undefined
      ? Boolean(request.body.isGrandFinale)
      : !Boolean(settingsDoc.isGrandFinale);

  settingsDoc.isGrandFinale = newValue;
  await settingsDoc.save();

  await Setting.findOneAndUpdate(
    { key: 'isGrandFinale' },
    { value: newValue },
    { upsert: true, new: true }
  );

  // Instantly emit FINALE_TRIGGERED WebSocket event to all connected clients
  broadcastFinaleTriggered({ isGrandFinale: newValue });

  await logAdminAction(request, 'SITE_CONFIG_UPDATED', null, { isGrandFinale: newValue });

  return reply.send({
    message: `Grand Finale Mode is now ${newValue ? '🏆 ACTIVE (GOLD THEME)' : '🎪 STANDARD CARNIVAL'}`,
    isGrandFinale: newValue,
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
      const totalPoints = scores.reduce((acc, curr: any) => {
        const pts = curr.pointsEarned ?? curr.total ?? curr.scores?.total ?? ((curr.main || 0) + (curr.special || 0) + (curr.adv || 0));
        return acc + (pts || 0);
      }, 0);
      return {
        ...team,
        points: totalPoints,
        totalPoints,
      };
    })
  );

  // Sort teams using standard status priority & point sorting logic
  const getStatusPriority = (status: string = ''): number => {
    const s = status ? status.toString().trim().toLowerCase() : '';
    if (s === 'qualified') return 1;
    if (s === 'safe' || s === 'approved' || s === 'pending') return 2;
    if (s === 'danger') return 3;
    if (s === 'eliminated' || s === 'rejected') return 4;
    return 2;
  };

  teamsWithScores.sort((a: any, b: any) => {
    const pA = getStatusPriority(a.status);
    const pB = getStatusPriority(b.status);
    if (pA !== pB) return pA - pB;
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return (a.teamName || '').localeCompare(b.teamName || '');
  });

  teamsWithScores.forEach((t: any, idx: number) => {
    t.rank = idx + 1;
  });

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

  await logAdminAction(request, 'TEAM_STATUS_CHANGED', team._id, {
    status: team.status,
    teamName: team.teamName,
  });

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

  await logAdminAction(request, 'TEAM_STATUS_CHANGED', team._id, {
    status: 'Eliminated',
    teamName: team.teamName,
  });

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

export async function deleteTeam(
  request: FastifyRequest<{ Params: { teamId?: string; id?: string } }>,
  reply: FastifyReply
) {
  const teamId = request.params.teamId || request.params.id;

  if (!teamId) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Team ID parameter is required' });
  }

  let team = null;
  if (mongoose.Types.ObjectId.isValid(teamId)) {
    team = await Team.findByIdAndDelete(teamId);
  }
  if (!team) {
    team = await Team.findOneAndDelete({ teamName: teamId });
  }

  if (!team) {
    return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
  }

  // Delete all score documents associated with this team
  await Score.deleteMany({ team: team._id });

  // Broadcast status change / removal to frontend clients
  teamBroadcaster.emit('status-changed', {
    teamId: team._id.toString(),
    teamName: team.teamName,
    status: 'Deleted',
    timestamp: new Date().toISOString(),
  });
  broadcastStatusChanged({
    teamId: team._id.toString(),
    teamName: team.teamName,
    status: 'Deleted',
    timestamp: new Date().toISOString(),
  });

  await delCache('cwc:leaderboard');

  await logAdminAction(request, 'TEAM_DELETED', team._id, {
    teamName: team.teamName,
  });

  return reply.send({
    message: `Team '${team.teamName}' deleted permanently! 🗑️`,
    teamId: team._id.toString(),
  });
}

export async function updateTeamDetails(
  request: FastifyRequest<{
    Params: { id?: string; teamId?: string };
    Body: {
      teamName?: string;
      tagline?: string;
      status?: 'Pending' | 'Approved' | 'Rejected' | 'Eliminated' | 'Safe' | 'Danger' | 'Qualified';
      themeColor?: string;
      residenceType?: 'Hosteller' | 'DayScholar' | 'Day Scholar';
      leader?: {
        name?: string;
        email?: string;
        phone?: string;
        rollNumber?: string;
        department?: string;
      };
      points?: number;
      totalPoints?: number;
      members?: Array<{
        name?: string;
        rollNo?: string;
        rollNumber?: string;
        deptMailId?: string;
        email?: string;
        phone?: string;
        gender?: 'Male' | 'Female' | 'Other';
        residenceType?: 'Hosteller' | 'DayScholar' | 'Day Scholar';
        role?: string;
        userId?: string;
      }>;
    };
  }>,
  reply: FastifyReply
) {
  const teamId = request.params.id || request.params.teamId;
  const { teamName, status, themeColor, residenceType, leader, members } = request.body || {};

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

  if (teamName !== undefined && teamName.trim()) team.teamName = teamName.trim();
  if (status !== undefined) team.status = status;
  if (themeColor !== undefined && themeColor.trim()) team.themeColor = themeColor.trim();
  if (residenceType !== undefined) team.residenceType = residenceType;

  if (leader) {
    team.leader = {
      name: leader.name ?? team.leader?.name ?? '',
      email: (leader.email ?? team.leader?.email ?? '').toLowerCase().trim(),
      phone: leader.phone ?? team.leader?.phone ?? '',
      rollNumber: leader.rollNumber ?? team.leader?.rollNumber ?? '',
      department: leader.department ?? team.leader?.department ?? '',
      userId: team.leader?.userId,
    };
  }

  if (Array.isArray(members)) {
    team.members = members.map((m, idx) => {
      const memberName = m.name?.trim() || `Member ${idx + 1}`;
      const roll = m.rollNo?.trim() || m.rollNumber?.trim() || `ROLL-${idx + 1}`;
      const mail = (m.deptMailId?.trim() || m.email?.trim() || `member${idx + 1}@cwc.io`).toLowerCase();
      const resType = m.residenceType === 'Day Scholar' ? 'DayScholar' : (m.residenceType || 'Hosteller');
      return {
        name: memberName,
        rollNo: roll,
        rollNumber: roll,
        deptMailId: mail,
        email: mail,
        phone: m.phone?.trim() || '0000000000',
        gender: m.gender || 'Male',
        residenceType: resType as 'Hosteller' | 'DayScholar',
        role: m.role || (idx === 0 ? 'Leader' : 'Member'),
        userId: m.userId as any,
      };
    });
  }

  await team.save();

  const targetPoints = request.body.points !== undefined ? request.body.points : request.body.totalPoints;
  if (targetPoints !== undefined && typeof targetPoints === 'number' && targetPoints >= 0) {
    let scoreDoc = await Score.findOne({ team: team._id }).sort({ dayNumber: 1 });
    if (!scoreDoc) {
      scoreDoc = new Score({
        team: team._id,
        dayNumber: 1,
        day: 1,
        date: new Date(),
        scores: { adv: 0, main: targetPoints, special: 0, total: targetPoints },
        adv: 0,
        main: targetPoints,
        special: 0,
        total: targetPoints,
        pointsEarned: targetPoints,
      });
    } else {
      const adv = scoreDoc.scores?.adv || scoreDoc.adv || 0;
      const special = scoreDoc.scores?.special || scoreDoc.special || 0;
      const computedTotal = adv + targetPoints + special;
      scoreDoc.main = targetPoints;
      scoreDoc.total = computedTotal;
      scoreDoc.pointsEarned = computedTotal;
      scoreDoc.scores = { adv, main: targetPoints, special, total: computedTotal };
    }
    await scoreDoc.save();

    broadcastScoreUpdated({
      teamId: team._id.toString(),
      teamName: team.teamName,
      points: targetPoints,
    });
  }

  await delCache('cwc:leaderboard');

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

  await logAdminAction(request, 'TEAM_UPDATED', team._id, {
    teamName: team.teamName,
    status: team.status,
    membersCount: team.members.length,
  });

  const teamScores = await Score.find({ team: team._id });
  const updatedTotalPoints = teamScores.reduce((acc, curr: any) => {
    const pts = curr.pointsEarned ?? curr.total ?? curr.scores?.total ?? ((curr.main || 0) + (curr.special || 0) + (curr.adv || 0));
    return acc + (pts || 0);
  }, 0);

  return reply.send({
    message: `Team '${team.teamName}' and member details updated successfully! 🎪`,
    team: {
      ...team.toObject(),
      points: updatedTotalPoints,
      totalPoints: updatedTotalPoints,
    },
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

  if (!title || !type || points === undefined) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Missing required fields for task creation',
    });
  }

  const start = startTime ? new Date(startTime) : new Date();
  const end = endTime ? new Date(endTime) : new Date(Date.now() + 86400000);

  const newTask = await Task.create({
    title,
    description: description || '',
    type,
    points,
    startTime: start,
    endTime: end,
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

  await logAdminAction(request, 'TASK_CREATED', newTask._id, {
    title: newTask.title,
    type: newTask.type,
    points: newTask.points,
  });

  return reply.status(201).send({
    message: 'Task created successfully! 🎯',
    task: newTask,
  });
}

export async function getAllTasksAdmin(_request: FastifyRequest, reply: FastifyReply) {
  const tasks = await Task.find().sort({ startTime: 1, createdAt: -1 });
  return reply.send({ tasks });
}

export async function updateTask(
  request: FastifyRequest<{ Params: { id?: string; taskId?: string }; Body: Partial<CreateTaskBody> }>,
  reply: FastifyReply
) {
  const taskId = request.params.taskId || request.params.id;
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

  await logAdminAction(request, 'TASK_UPDATED', updatedTask._id, updateData);

  return reply.send({
    message: 'Task updated successfully! 🎯',
    task: updatedTask,
  });
}

export async function deleteTask(
  request: FastifyRequest<{ Params: { id?: string; taskId?: string } }>,
  reply: FastifyReply
) {
  const taskId = request.params.taskId || request.params.id;
  const deletedTask = await Task.findByIdAndDelete(taskId);

  if (!deletedTask) {
    return reply.status(404).send({ error: 'Not Found', message: 'Task not found' });
  }

  await logAdminAction(request, 'TASK_DELETED', taskId, { title: deletedTask.title });

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
  const { message, pinned = false, author, sendEmailAlert = true } = request.body;

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

  const shouldSendEmail = sendEmailAlert !== false;

  await logAdminAction(request, 'ANNOUNCEMENT_CREATED', announcement._id, {
    message: announcement.message,
    author: announcement.author,
    sendEmailAlert: shouldSendEmail,
  });

  // Broadcast WebSocket event for NEW_ANNOUNCEMENT
  broadcastNewAnnouncement({
    announcement,
    message: announcement.message,
    pinned: announcement.pinned,
    author: announcement.author,
    timestamp: announcement.timestamp,
  });

  // Trigger background email broadcast if sendEmailAlert is true or not explicitly set to false
  if (shouldSendEmail) {
    setImmediate(async () => {
      try {
        const [users, teams] = await Promise.all([
          User.find({ role: { $in: ['student', 'leader', 'member', 'user'] } }).select('email').lean(),
          Team.find().lean(),
        ]);

        const emails: string[] = [];

        users.forEach((u) => {
          if (u.email) emails.push(u.email);
        });

        teams.forEach((t) => {
          if (t.leader?.email) emails.push(t.leader.email);
          if (Array.isArray(t.members)) {
            t.members.forEach((m: any) => {
              if (m.email) emails.push(m.email);
              if (m.deptMailId) emails.push(m.deptMailId);
            });
          }
        });

        const recipients = Array.from(
          new Set(
            emails
              .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
              .filter((e) => e && e.includes('@'))
          )
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
    message: shouldSendEmail
      ? 'Global announcement posted & background email alerts dispatched! 📢📧'
      : 'Global announcement posted! 📢',
    announcement,
    emailAlertTriggered: shouldSendEmail,
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

  await logAdminAction(request, 'ANNOUNCEMENT_DELETED', announcementId, {
    message: deleted.message,
  });

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

    await logAdminAction(request, 'GRANT_ADVANTAGE', team._id, {
      advantage: effectiveAdvantage,
      quantity,
      immunity: team.immunity,
      teamName: team.teamName,
    });

    // Broadcast WebSocket event for advantage grant
    broadcastAdvantageGranted({
      teamId: team._id.toString(),
      teamName: team.teamName,
      advantage: effectiveAdvantage,
      quantity,
      advantages: team.advantages,
      immunity: team.immunity,
    });
    broadcastStatusChanged({
      teamId: team._id.toString(),
      teamName: team.teamName,
      advantage: effectiveAdvantage,
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

  await logAdminAction(request, 'GRANT_IMMUNITY', team._id, {
    immunity: team.immunity,
    teamName: team.teamName,
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
        const totalPoints = item.totalPoints !== undefined ? item.totalPoints : ((item.mainTaskScore || 0) + (item.specialTaskScore || 0));
        await Score.findOneAndUpdate(
          { team: item.teamId, task: taskDoc._id },
          {
            team: item.teamId,
            task: taskDoc._id,
            pointsEarned: totalPoints,
            main: item.mainTaskScore || 0,
            special: item.specialTaskScore || 0,
            total: totalPoints,
            scores: { adv: 0, main: item.mainTaskScore || 0, special: item.specialTaskScore || 0, total: totalPoints },
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

  await logAdminAction(request, 'SCORE_UPDATED', null, {
    updatedCount: results.length,
    scores,
  });

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

export async function upsertScore(
  request: FastifyRequest<{
    Body: {
      teamId: string;
      dayNumber?: number;
      day?: number;
      date?: string | Date;
      adv?: number;
      main?: number;
      special?: number;
    };
  }>,
  reply: FastifyReply
) {
  const { teamId, date, adv = 0, main = 0, special = 0 } = request.body || {};
  const dayNum = Number(request.body?.dayNumber || request.body?.day || 1);

  if (!teamId) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'teamId is required for score updates',
    });
  }

  const isRealObjectId = mongoose.Types.ObjectId.isValid(teamId);
  let team: any = null;
  if (isRealObjectId) {
    team = await Team.findById(teamId);
  }
  if (!team) {
    team = await Team.findOne({ teamName: teamId });
  }

  const teamName = team ? team.teamName : (teamId.includes('team-') ? teamId.replace('team-', 'Team ') : teamId);

  const numAdv = Number(adv) || 0;
  const numMain = Number(main) || 0;
  const numSpecial = Number(special) || 0;
  const computedTotal = numAdv + numMain + numSpecial;
  const scoreDate = date ? new Date(date) : new Date();

  let scoreDoc: any = null;
  if (isRealObjectId) {
    const prevScore = await Score.findOne({ team: teamId, dayNumber: dayNum });
    const beforeValues = prevScore
      ? {
          scores: prevScore.scores || { adv: prevScore.adv, main: prevScore.main, special: prevScore.special, total: prevScore.total },
          dayNumber: prevScore.dayNumber,
          date: prevScore.date,
        }
      : null;

    scoreDoc = await Score.findOneAndUpdate(
      { team: teamId, dayNumber: dayNum },
      {
        team: teamId,
        dayNumber: dayNum,
        day: dayNum,
        date: scoreDate,
        scores: {
          adv: numAdv,
          main: numMain,
          special: numSpecial,
          total: computedTotal,
        },
        adv: numAdv,
        main: numMain,
        special: numSpecial,
        total: computedTotal,
        pointsEarned: computedTotal,
        recordedBy: (request.user as any)?.id && mongoose.Types.ObjectId.isValid((request.user as any)?.id) ? (request.user as any)?.id : null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await delCache('cwc:leaderboard');

    await logAdminAction(request, 'SCORE_UPDATED', teamId, {
      teamName,
      dayNumber: dayNum,
      before: beforeValues,
      after: { scores: scoreDoc.scores, dayNumber: scoreDoc.dayNumber, date: scoreDoc.date },
    });
  } else {
    scoreDoc = {
      team: teamId,
      dayNumber: dayNum,
      day: dayNum,
      date: scoreDate,
      scores: { adv: numAdv, main: numMain, special: numSpecial, total: computedTotal },
      total: computedTotal,
    };
  }

  broadcastScoreUpdated({
    teamId,
    teamName,
    dayNumber: dayNum,
    scores: scoreDoc.scores,
  });

  return reply.send({
    message: `Score updated for team '${teamName}' on Day ${dayNum} successfully! 📊`,
    score: scoreDoc,
  });
}

export async function getAdminScores(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const query = (request.query || {}) as { dayNumber?: string; day?: string };
  const dayNumber = Number(query.dayNumber || query.day || 1);
  const teams = await Team.find().lean();
  const scores = await Score.find({ dayNumber }).lean();

  const scoresMap = new Map();
  scores.forEach((s) => scoresMap.set(s.team.toString(), s));

  const result = teams.map((team, idx) => {
    const scoreDoc = scoresMap.get(team._id.toString());
    const adv = scoreDoc?.scores?.adv ?? scoreDoc?.adv ?? 0;
    const main = scoreDoc?.scores?.main ?? scoreDoc?.main ?? 0;
    const special = scoreDoc?.scores?.special ?? scoreDoc?.special ?? 0;
    const total = scoreDoc?.scores?.total ?? scoreDoc?.total ?? (adv + main + special);

    return {
      teamId: team._id.toString(),
      teamName: team.teamName,
      teamAvatar: (team as any).teamAvatar || '🎪',
      leaderName: (team.leader as any)?.name || 'Team Leader',
      advantage: team.advantages && team.advantages.length > 0 ? team.advantages[team.advantages.length - 1].advantage : 'None',
      advScore: adv,
      mainTaskScore: main,
      specialTaskScore: special,
      totalScore: total,
      elimination: team.status === 'Eliminated',
      immunity: Boolean(team.immunity),
      status: team.status || 'Safe',
      rank: idx + 1,
    };
  });

  const getStatusPriority = (status: string = ''): number => {
    const s = status ? status.toString().trim().toLowerCase() : '';
    if (s === 'qualified') return 1;
    if (s === 'safe' || s === 'approved' || s === 'pending') return 2;
    if (s === 'danger') return 3;
    if (s === 'eliminated' || s === 'rejected') return 4;
    return 2;
  };

  // Sort by status priority first, then totalScore descending, then teamName
  result.sort((a, b) => {
    const pA = getStatusPriority(a.status);
    const pB = getStatusPriority(b.status);
    if (pA !== pB) return pA - pB;
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return (a.teamName || '').localeCompare(b.teamName || '');
  });
  result.forEach((item, index) => {
    item.rank = index + 1;
  });

  return reply.send({
    dayNumber,
    scores: result,
  });
}

/* ==========================================================================
   BUZZER QUESTION MANAGEMENT CONTROLLERS
   ========================================================================== */

export async function getBuzzerQuestions(_request: FastifyRequest, reply: FastifyReply) {
  const questions = await BuzzerQuestion.find().sort({ createdAt: -1 });
  return reply.send({ questions });
}

export async function createBuzzerQuestion(
  request: FastifyRequest<{
    Body: { title: string; questionText: string; expectedAnswer?: string };
  }>,
  reply: FastifyReply
) {
  const { title, questionText, expectedAnswer } = request.body || {};

  if (!title || !questionText) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Question title and questionText are required',
    });
  }

  const question = await BuzzerQuestion.create({
    title,
    questionText,
    expectedAnswer: expectedAnswer || '',
  });

  await logAdminAction(request, 'BUZZER_QUESTION_CREATED', question._id, {
    title: question.title,
  });

  return reply.status(201).send({
    message: 'Buzzer question created successfully 🎯',
    question,
  });
}

export async function updateBuzzerQuestion(
  request: FastifyRequest<{
    Params: { id: string };
    Body: { title?: string; questionText?: string; expectedAnswer?: string };
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const updateData = request.body || {};

  const question = await BuzzerQuestion.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!question) {
    return reply.status(404).send({ error: 'Not Found', message: 'Buzzer question not found' });
  }

  await logAdminAction(request, 'BUZZER_QUESTION_UPDATED', id, updateData);

  return reply.send({
    message: 'Buzzer question updated successfully 🎯',
    question,
  });
}

export async function deleteBuzzerQuestion(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const question = await BuzzerQuestion.findByIdAndDelete(id);

  if (!question) {
    return reply.status(404).send({ error: 'Not Found', message: 'Buzzer question not found' });
  }

  await logAdminAction(request, 'BUZZER_QUESTION_DELETED', id, { title: question.title });

  return reply.send({
    message: 'Buzzer question deleted successfully.',
    id,
  });
}

/* ==========================================================================
   BULK EXCEL TEAMS UPLOAD & TEMPLATE DOWNLOAD CONTROLLERS
   ========================================================================== */

export async function downloadTeamsTemplate(_request: FastifyRequest, reply: FastifyReply) {
  const sampleData = [
    {
      "Team Name": "Cyber Knights",
      "Tagline": "Hackers of Season 4",
      "Theme Color": "#FF0055",
      "Residence Type": "Hosteller",
      "Member 1 Name (Leader)": "Alex Vance",
      "Member 1 Email": "alex.vance@cwc.edu",
      "Member 1 Roll No": "21CS001",
      "Member 1 Phone": "9876543210",
      "Member 1 Gender": "Male",
      "Member 1 Residence": "Hosteller",
      "Member 2 Name": "Sarah Connor",
      "Member 2 Email": "sarah.c@cwc.edu",
      "Member 2 Roll No": "21CS002",
      "Member 2 Phone": "9876543211",
      "Member 2 Gender": "Female",
      "Member 2 Residence": "DayScholar",
      "Member 3 Name": "Bruce Wayne",
      "Member 3 Email": "bruce.w@cwc.edu",
      "Member 3 Roll No": "21CS003",
      "Member 3 Phone": "9876543212",
      "Member 3 Gender": "Male",
      "Member 3 Residence": "Hosteller",
      "Member 4 Name": "Diana Prince",
      "Member 4 Email": "diana.p@cwc.edu",
      "Member 4 Roll No": "21CS004",
      "Member 4 Phone": "9876543213",
      "Member 4 Gender": "Female",
      "Member 4 Residence": "DayScholar"
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Teams Template");
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  reply.header('Content-Disposition', 'attachment; filename="CWC_Season4_Teams_Import_Template.xlsx"');
  return reply.send(excelBuffer);
}

export async function importTeamsBulk(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    let teamsData: any[] = [];

    if (request.isMultipart()) {
      const fileData = await request.file();
      if (!fileData) {
        return reply.status(400).send({ error: 'Bad Request', message: 'No Excel file uploaded.' });
      }
      const buffer = await fileData.toBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      teamsData = XLSX.utils.sheet_to_json(worksheet);
    } else if (request.body && typeof request.body === 'object') {
      const body = request.body as any;
      if (Array.isArray(body)) {
        teamsData = body;
      } else if (Array.isArray(body.teams)) {
        teamsData = body.teams;
      }
    }

    if (!Array.isArray(teamsData) || teamsData.length === 0) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'No valid team records found in uploaded file or request payload.',
      });
    }

    const defaultPasswordHash = await bcrypt.hash('CWC4-Student-2026', 10);
    const createdTeams: any[] = [];
    const skippedTeams: Array<{ teamName: string; reason: string }> = [];

    for (const row of teamsData) {
      const getVal = (possibleKeys: string[]): string => {
        for (const k of Object.keys(row)) {
          const cleanK = k.trim().toLowerCase();
          if (possibleKeys.some((pk) => pk.toLowerCase() === cleanK)) {
            return String(row[k] || '').trim();
          }
        }
        return '';
      };

      const teamName = getVal(['Team Name', 'teamName', 'TeamName', 'Name', 'Team']);
      if (!teamName) {
        skippedTeams.push({ teamName: 'Unknown Row', reason: 'Missing Team Name' });
        continue;
      }

      const existingTeam = await Team.findOne({ teamName: new RegExp(`^${teamName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') });
      if (existingTeam) {
        skippedTeams.push({ teamName, reason: 'Team name already exists in database' });
        continue;
      }

      const tagline = getVal(['Tagline', 'tagline', 'Description', 'description']) || 'Carnival contender';
      const themeColor = getVal(['Theme Color', 'themeColor', 'Color']) || '#FF0055';
      const residenceTypeStr = getVal(['Residence Type', 'residenceType']);
      const residenceType = (residenceTypeStr === 'DayScholar' || residenceTypeStr === 'Day Scholar') ? 'DayScholar' : 'Hosteller';

      const parsedMembers: any[] = [];
      for (let i = 1; i <= 4; i++) {
        const mName = getVal([`Member ${i} Name (Leader)`, `Member ${i} Name`, `m${i}_name`, `member${i}Name`]);
        const mEmail = getVal([`Member ${i} Email`, `m${i}_email`, `member${i}Email`]);
        const mRoll = getVal([`Member ${i} Roll No`, `Member ${i} Roll Number`, `m${i}_roll`, `member${i}RollNo`]);
        const mPhone = getVal([`Member ${i} Phone`, `m${i}_phone`, `member${i}Phone`]);
        const mGenderStr = getVal([`Member ${i} Gender`, `m${i}_gender`]);
        const mResStr = getVal([`Member ${i} Residence`, `Member ${i} Residence Type`, `m${i}_residence`]);

        const gender = (mGenderStr === 'Male' || mGenderStr === 'Female') ? mGenderStr : 'Other';
        const resType = (mResStr === 'DayScholar' || mResStr === 'Day Scholar') ? 'DayScholar' : 'Hosteller';

        const finalName = mName || (i === 1 ? `${teamName} Leader` : `${teamName} Member ${i}`);
        const finalEmail = (mEmail || `${teamName.toLowerCase().replace(/[^a-z0-9]/g, '')}.m${i}@cwc.edu`).toLowerCase();
        const finalRoll = mRoll || `ROLL-${i}`;
        const finalPhone = mPhone || '0000000000';

        let userDoc = await User.findOne({ email: finalEmail });
        if (!userDoc) {
          userDoc = await User.create({
            name: finalName,
            email: finalEmail,
            passwordHash: defaultPasswordHash,
            role: 'student',
            isFirstLogin: true,
          });
        }

        parsedMembers.push({
          name: finalName,
          rollNo: finalRoll,
          deptMailId: finalEmail,
          email: finalEmail,
          phone: finalPhone,
          gender,
          residenceType: resType,
          role: i === 1 ? 'Leader' : 'Member',
          userId: userDoc._id,
        });
      }

      const leaderObj = {
        name: parsedMembers[0].name,
        email: parsedMembers[0].deptMailId,
        phone: parsedMembers[0].phone,
        rollNumber: parsedMembers[0].rollNo,
        department: 'General',
        userId: parsedMembers[0].userId,
      };

      const newTeam = await Team.create({
        teamName,
        leader: leaderObj,
        members: parsedMembers,
        themeColor,
        status: 'Approved',
        residenceType,
        advantages: [],
        immunity: false,
        isBlocked: false,
      });

      createdTeams.push(newTeam);
    }

    await delCache('cwc:leaderboard');
    await delCache('cwc:fan-favorite');

    await logAdminAction(request, 'BULK_TEAMS_IMPORTED', null, {
      importedCount: createdTeams.length,
      skippedCount: skippedTeams.length,
      skipped: skippedTeams,
    });

    return reply.status(201).send({
      message: `🎉 Successfully imported ${createdTeams.length} approved teams!`,
      importedCount: createdTeams.length,
      skippedCount: skippedTeams.length,
      skippedTeams,
      teams: createdTeams,
    });
  } catch (err: any) {
    console.error('Bulk Team Upload Error:', err);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: err.message || 'Failed to process bulk team upload.',
    });
  }
}

/* ==========================================================================
   TIMELINE CMS CONTROLLERS
   ========================================================================== */

export async function getAdminTimeline(_request: FastifyRequest, reply: FastifyReply) {
  const { TimelineDay } = await import('../models/Timeline.js');

  const days = await TimelineDay.find().sort({ dayNumber: 1 }).lean();
  const categoryOrder = ['LUCKY BOOTH', 'GRAND CHALLENGE', 'FUN FAIR', 'DANGER ZONE', 'GOLDEN ZONE'];

  const timeline = await Promise.all(
    days.map(async (day) => {
      const tasks = await Task.find({ dayNumber: day.dayNumber }).lean();
      tasks.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.category || '');
        const indexB = categoryOrder.indexOf(b.category || '');
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      });
      return {
        ...day,
        tasks,
      };
    })
  );

  return reply.send({
    success: true,
    count: timeline.length,
    timeline,
  });
}

export async function updateTimelineDay(
  request: FastifyRequest<{
    Params: { dayNumber: string };
    Body: { theme?: string; daywiseName?: string; eliminationInfo?: string };
  }>,
  reply: FastifyReply
) {
  const { TimelineDay } = await import('../models/Timeline.js');
  const dayNum = parseInt(request.params.dayNumber, 10);
  const { theme, daywiseName, eliminationInfo } = request.body || {};

  const dayDoc = await TimelineDay.findOneAndUpdate(
    { dayNumber: dayNum },
    { $set: { theme, daywiseName, eliminationInfo } },
    { new: true, runValidators: true }
  );

  if (!dayDoc) {
    return reply.status(404).send({ error: 'Not Found', message: `Day ${dayNum} not found` });
  }

  await logAdminAction(request, 'TIMELINE_DAY_UPDATED', dayDoc._id, {
    dayNumber: dayNum,
    theme: dayDoc.theme,
    daywiseName: dayDoc.daywiseName,
  });

  return reply.send({
    message: `Day ${dayNum} timeline metadata updated successfully! 📅`,
    day: dayDoc,
  });
}

export async function updateTimelineTask(
  request: FastifyRequest<{
    Params: { id: string };
    Body: { taskDescription?: string; timeLimit?: string; category?: string; dayNumber?: number };
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { taskDescription, timeLimit, category, dayNumber } = request.body || {};

  const task = await Task.findByIdAndUpdate(
    id,
    { $set: { taskDescription, timeLimit, ...(category ? { category } : {}), ...(dayNumber ? { dayNumber } : {}) } },
    { new: true, runValidators: true }
  );

  if (!task) {
    return reply.status(404).send({ error: 'Not Found', message: 'Timeline task not found' });
  }

  await logAdminAction(request, 'TIMELINE_TASK_UPDATED', task._id, {
    category: task.category,
    dayNumber: task.dayNumber,
    taskDescription: task.taskDescription,
    timeLimit: task.timeLimit,
  });

  return reply.send({
    message: `Task '${task.category}' updated successfully! 🎯`,
    task,
  });
}

/* ==========================================================================
   VOTING & AUDIT CONTROLLERS FOR ADMIN & SUPERADMIN
   ========================================================================== */

export async function getAdminVotes(_request: FastifyRequest, reply: FastifyReply) {
  // Fetch all teams sorted by totalPublicVotes descending
  const teams = await Team.find().sort({ totalPublicVotes: -1, createdAt: 1 }).lean();

  const standings = teams.map((t: any, idx: number) => ({
    rank: idx + 1,
    teamId: t._id.toString(),
    teamName: t.teamName,
    leaderName: t.leader?.name || 'N/A',
    leaderEmail: t.leader?.email || 'N/A',
    residenceType: t.residenceType || 'Hosteller',
    totalPublicVotes: t.totalPublicVotes || 0,
    status: t.status || 'Approved',
    avatar: t.avatar || '🎪',
    themeColor: t.themeColor || '#FFD700',
  }));

  const totalVotesCast = standings.reduce((acc, t) => acc + t.totalPublicVotes, 0);

  // Fetch detailed vote audit logs populated with voter team and target team
  const rawLogs = await DailyVoteLog.find()
    .populate('voterTeamId', 'teamName leader')
    .populate('targetTeamId', 'teamName leader')
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  const voteAuditLogs = rawLogs.map((log: any) => {
    const isAdmin = log.voterType === 'Admin' || !log.voterTeamId;
    return {
      id: log._id.toString(),
      date: log.date,
      votesCast: log.votesCast,
      voterType: log.voterType || (isAdmin ? 'Admin' : 'Team'),
      voterName: isAdmin
        ? `Admin (${log.voterEmail || 'Ringmaster'})`
        : log.voterTeamId?.teamName || 'Unknown Team',
      voterEmail: isAdmin
        ? log.voterEmail || 'admin@cwc.org'
        : log.voterTeamId?.leader?.email || 'student@cwc.io',
      voterLeaderName: !isAdmin ? log.voterTeamId?.leader?.name || 'Team Leader' : 'Administrator',
      targetTeamId: log.targetTeamId?._id?.toString() || log.targetTeamId?.toString(),
      targetTeamName: log.targetTeamId?.teamName || 'Unknown Team',
      targetTeamLeader: log.targetTeamId?.leader?.name || 'Team Leader',
      createdAt: log.createdAt || log.updatedAt || new Date().toISOString(),
    };
  });

  return reply.send({
    success: true,
    totalVotesCast,
    totalTeams: standings.length,
    standings,
    voteAuditLogs,
  });
}

export async function adminCastVote(
  request: FastifyRequest<{ Body: { targetTeamId: string; voteCount: number } }>,
  reply: FastifyReply
) {
  const { targetTeamId, voteCount } = request.body || {};

  if (!targetTeamId) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Target team ID is required' });
  }

  const numVotes = Number(voteCount);
  if (isNaN(numVotes) || numVotes <= 0 || !Number.isInteger(numVotes)) {
    return reply.status(400).send({ error: 'Bad Request', message: 'voteCount must be a positive integer' });
  }

  const targetTeam = await Team.findById(targetTeamId);
  if (!targetTeam) {
    return reply.status(404).send({ error: 'Not Found', message: 'Target team not found' });
  }

  const adminEmail = (request.user as any)?.email || 'admin@cwc.org';
  const today = new Date().toISOString().split('T')[0];

  // Increment target team's totalPublicVotes
  targetTeam.totalPublicVotes = (targetTeam.totalPublicVotes || 0) + numVotes;
  await targetTeam.save();

  // Record Admin Vote Log
  await DailyVoteLog.create({
    targetTeamId: targetTeam._id,
    voterType: 'Admin',
    voterEmail: adminEmail,
    date: today,
    votesCast: numVotes,
  });

  // Invalidate Redis Caches
  await delCache('cwc:leaderboard');
  await delCache('cwc:fan-favorite');

  // Broadcast WebSocket event
  broadcastVotesUpdated({
    voterTeamId: 'ADMIN',
    voterTeamName: `Admin (${adminEmail})`,
    targetTeamId: targetTeam._id.toString(),
    targetTeamName: targetTeam.teamName,
    votesCast: numVotes,
    totalPublicVotes: targetTeam.totalPublicVotes,
  });

  await logAdminAction(request, 'ADMIN_CAST_VOTE', targetTeam._id, {
    votesCast: numVotes,
    targetTeamName: targetTeam.teamName,
    adminEmail,
  });

  return reply.send({
    success: true,
    message: `🎉 Successfully cast ${numVotes} admin vote(s) for '${targetTeam.teamName}'!`,
    team: {
      id: targetTeam._id,
      teamName: targetTeam.teamName,
      totalPublicVotes: targetTeam.totalPublicVotes,
    },
  });
}



