import { FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import { Attendance } from '../models/Attendance.js';
import { Team } from '../models/Team.js';
import { broadcastStatusChanged } from '../socket.js';
import { teamBroadcaster } from './adminController.js';

/* ==========================================================================
   GET ATTENDANCE RECORDS
   ========================================================================== */
export async function getAttendance(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { dayNumber, teamId } = request.query as { dayNumber?: string; teamId?: string };
  const filter: any = {};

  if (dayNumber) {
    filter.dayNumber = parseInt(dayNumber, 10);
  }
  if (teamId) {
    if (mongoose.Types.ObjectId.isValid(teamId)) {
      filter.teamId = teamId;
    }
  }

  const attendanceRecords = await Attendance.find(filter).populate('teamId', 'teamName leader status residenceType').lean();

  return reply.send({
    count: attendanceRecords.length,
    attendance: attendanceRecords,
  });
}

/* ==========================================================================
   SAVE / TOGGLE ATTENDANCE FOR A TEAM FOR A DAY
   ========================================================================== */
interface SaveAttendanceBody {
  teamId: string;
  dayNumber: number;
  memberIdsPresent: string[];
  isTeamPresent?: boolean;
}

export async function saveAttendance(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { teamId, dayNumber, memberIdsPresent = [], isTeamPresent = true } = (request.body || {}) as SaveAttendanceBody;

  if (!teamId || !dayNumber) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'teamId and dayNumber are required',
    });
  }

  // Find team by ID or teamName
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

  const attendanceRecord = await Attendance.findOneAndUpdate(
    { teamId: team._id, dayNumber },
    {
      teamId: team._id,
      dayNumber,
      memberIdsPresent,
      isTeamPresent,
      timestamp: new Date(),
    },
    { upsert: true, new: true, runValidators: true }
  );

  return reply.send({
    message: `Attendance updated for team '${team.teamName}' on Day ${dayNumber}! 📋`,
    attendance: attendanceRecord,
  });
}

/* ==========================================================================
   AUTO-CHECKER FOR MINIMUM ATTENDANCE RULES
   Rule Book Policy:
   - Minimum 50% member attendance required on every daily session.
   - Cumulative presence rate across days must be at least 60%.
   - Teams failing minimum attendance rules have their status flagged as 'Danger'.
   ========================================================================== */
export async function runAttendanceAutoChecker(_request: FastifyRequest, reply: FastifyReply) {
  const teams = await Team.find({ status: { $ne: 'Eliminated' } });
  const allAttendance = await Attendance.find().lean();

  const flaggedTeams: Array<{ id: string; name: string; reason: string; status: string }> = [];

  for (const team of teams) {
    const teamAttendance = allAttendance.filter(
      (a) => a.teamId.toString() === team._id.toString()
    );

    const totalTeamMembers = 1 + (team.members?.length || 0); // Leader + members
    let minMemberAttendanceFailed = false;
    let totalPresentMembersCount = 0;
    let totalPossibleMembersCount = 0;

    for (const record of teamAttendance) {
      const presentCount = record.memberIdsPresent?.length || 0;
      totalPresentMembersCount += presentCount;
      totalPossibleMembersCount += totalTeamMembers;

      // Check daily 50% rule
      if (presentCount < Math.ceil(totalTeamMembers * 0.5)) {
        minMemberAttendanceFailed = true;
      }
    }

    const overallRate =
      totalPossibleMembersCount > 0
        ? (totalPresentMembersCount / totalPossibleMembersCount) * 100
        : 100;

    // Flag if daily rule failed or cumulative < 60%
    if (minMemberAttendanceFailed || overallRate < 60) {
      const reason = minMemberAttendanceFailed
        ? 'Failed 50% daily member presence rule'
        : `Overall attendance rate (${Math.round(overallRate)}%) below 60% threshold`;

      team.status = 'Danger';
      await team.save();

      teamBroadcaster.emit('status-changed', {
        teamId: team._id.toString(),
        teamName: team.teamName,
        status: 'Danger',
        timestamp: new Date().toISOString(),
      });
      broadcastStatusChanged({
        teamId: team._id.toString(),
        teamName: team.teamName,
        status: 'Danger',
        timestamp: new Date().toISOString(),
      });

      flaggedTeams.push({
        id: team._id.toString(),
        name: team.teamName,
        reason,
        status: 'Danger',
      });
    }
  }

  return reply.send({
    message: `Attendance Auto-Checker completed! Evaluated ${teams.length} teams. Flagged ${flaggedTeams.length} teams as 'In Danger'. ⚠️`,
    totalEvaluated: teams.length,
    flaggedCount: flaggedTeams.length,
    flaggedTeams,
  });
}
