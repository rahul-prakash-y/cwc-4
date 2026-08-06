import mongoose from 'mongoose';
import { Attendance } from '../models/Attendance.js';
import { Team } from '../models/Team.js';
import { broadcastStatusChanged } from '../socket.js';
import { teamBroadcaster } from './adminController.js';
import { sendCarnivalEmail } from '../utils/mailer.js';
import { getStatusAlertEmailHtml } from '../utils/emailTemplates.js';
/* ==========================================================================
   GET ATTENDANCE RECORDS
   ========================================================================== */
export async function getAttendance(request, reply) {
    const { dayNumber, teamId } = request.query;
    const filter = {};
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
   RULE BOOK AUTO-ENFORCEMENT ENGINE
   Logic: If a team has less than 2 members present for a given day,
   automatically change their team status to 'Danger' and emit the STATUS_CHANGED WebSocket event.
   ========================================================================== */
export async function enforceAttendanceRules(teamId, memberIdsPresent, dayNumber) {
    const presentCount = Array.isArray(memberIdsPresent) ? memberIdsPresent.length : 0;
    if (presentCount < 2) {
        let team = null;
        if (mongoose.Types.ObjectId.isValid(teamId)) {
            team = await Team.findById(teamId);
        }
        if (!team) {
            team = await Team.findOne({ teamName: teamId });
        }
        if (team && team.status !== 'Eliminated' && team.status !== 'Danger') {
            team.status = 'Danger';
            await team.save();
            // Emit STATUS_CHANGED WebSocket events to all listening clients & admin stream
            teamBroadcaster.emit('status-changed', {
                teamId: team._id.toString(),
                teamName: team.teamName,
                status: 'Danger',
                dayNumber,
                reason: `Less than 2 members present on Day ${dayNumber}`,
                timestamp: new Date().toISOString(),
            });
            broadcastStatusChanged({
                teamId: team._id.toString(),
                teamName: team.teamName,
                status: 'Danger',
                dayNumber,
                reason: `Less than 2 members present on Day ${dayNumber}`,
                timestamp: new Date().toISOString(),
            });
            // Trigger Status Alert Email if leader email is registered
            if (team.leader?.email) {
                const leaderEmail = team.leader.email;
                const teamName = team.teamName;
                setImmediate(() => {
                    const html = getStatusAlertEmailHtml({
                        teamName,
                        status: 'Danger',
                    });
                    sendCarnivalEmail(leaderEmail, `⚠️ Alert: Danger Status Triggered (Day ${dayNumber} Attendance Rule) - Team ${teamName}`, html);
                });
            }
            return { teamId: team._id.toString(), statusChanged: true, newStatus: 'Danger' };
        }
    }
    return { teamId, statusChanged: false };
}
export async function saveAttendance(request, reply) {
    const body = (request.body || {});
    const { dayNumber, attendanceBatch } = body;
    if (!dayNumber) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'dayNumber is required',
        });
    }
    // Handle Batch saving if attendanceBatch array is provided
    if (Array.isArray(attendanceBatch) && attendanceBatch.length > 0) {
        const savedRecords = [];
        const ruleEnforcementResults = [];
        for (const item of attendanceBatch) {
            if (!item.teamId)
                continue;
            let team = null;
            if (mongoose.Types.ObjectId.isValid(item.teamId)) {
                team = await Team.findById(item.teamId);
            }
            if (!team) {
                team = await Team.findOne({ teamName: item.teamId });
            }
            if (!team)
                continue;
            const record = await Attendance.findOneAndUpdate({ teamId: team._id, dayNumber }, {
                teamId: team._id,
                dayNumber,
                memberIdsPresent: item.memberIdsPresent || [],
                isTeamPresent: (item.memberIdsPresent || []).length >= 2,
                timestamp: new Date(),
            }, { upsert: true, new: true, runValidators: true });
            savedRecords.push(record);
            // Run Rule Book Auto-Enforcement Engine
            const ruleResult = await enforceAttendanceRules(team._id.toString(), item.memberIdsPresent || [], dayNumber);
            if (ruleResult.statusChanged) {
                ruleEnforcementResults.push(ruleResult);
            }
        }
        return reply.send({
            message: `Batch attendance saved for ${savedRecords.length} teams on Day ${dayNumber}! 📋`,
            updatedCount: savedRecords.length,
            flaggedCount: ruleEnforcementResults.length,
            ruleEnforcements: ruleEnforcementResults,
        });
    }
    // Handle single team saving
    const { teamId, memberIdsPresent = [], isTeamPresent } = body;
    if (!teamId) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'teamId or attendanceBatch is required',
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
    const attendanceRecord = await Attendance.findOneAndUpdate({ teamId: team._id, dayNumber }, {
        teamId: team._id,
        dayNumber,
        memberIdsPresent,
        isTeamPresent: isTeamPresent !== undefined ? isTeamPresent : memberIdsPresent.length >= 2,
        timestamp: new Date(),
    }, { upsert: true, new: true, runValidators: true });
    // Run Rule Book Auto-Enforcement Engine after attendance submission
    const ruleResult = await enforceAttendanceRules(team._id.toString(), memberIdsPresent, dayNumber);
    return reply.send({
        message: `Attendance updated for team '${team.teamName}' on Day ${dayNumber}! 📋`,
        attendance: attendanceRecord,
        ruleEnforcement: ruleResult,
    });
}
/* ==========================================================================
   AUTO-CHECKER FOR MINIMUM ATTENDANCE RULES (OVERALL BATCH ROUTE)
   ========================================================================== */
export async function runAttendanceAutoChecker(_request, reply) {
    const teams = await Team.find({ status: { $ne: 'Eliminated' } });
    const allAttendance = await Attendance.find().lean();
    const flaggedTeams = [];
    for (const team of teams) {
        const teamAttendance = allAttendance.filter((a) => a.teamId.toString() === team._id.toString());
        const totalTeamMembers = 1 + (team.members?.length || 0); // Leader + members
        let minMemberAttendanceFailed = false;
        let totalPresentMembersCount = 0;
        let totalPossibleMembersCount = 0;
        for (const record of teamAttendance) {
            const presentCount = record.memberIdsPresent?.length || 0;
            totalPresentMembersCount += presentCount;
            totalPossibleMembersCount += totalTeamMembers;
            // Rule: Less than 2 members present on any day flags Danger
            if (presentCount < 2) {
                minMemberAttendanceFailed = true;
            }
        }
        const overallRate = totalPossibleMembersCount > 0
            ? (totalPresentMembersCount / totalPossibleMembersCount) * 100
            : 100;
        // Flag if daily rule failed or cumulative < 60%
        if (minMemberAttendanceFailed || overallRate < 60) {
            const reason = minMemberAttendanceFailed
                ? 'Failed 2-member minimum daily presence rule'
                : `Overall attendance rate (${Math.round(overallRate)}%) below 60% threshold`;
            if (team.status !== 'Eliminated' && team.status !== 'Danger') {
                team.status = 'Danger';
                await team.save();
                teamBroadcaster.emit('status-changed', {
                    teamId: team._id.toString(),
                    teamName: team.teamName,
                    status: 'Danger',
                    reason,
                    timestamp: new Date().toISOString(),
                });
                broadcastStatusChanged({
                    teamId: team._id.toString(),
                    teamName: team.teamName,
                    status: 'Danger',
                    reason,
                    timestamp: new Date().toISOString(),
                });
                if (team.leader?.email) {
                    setImmediate(() => {
                        const html = getStatusAlertEmailHtml({
                            teamName: team.teamName,
                            status: 'Danger',
                        });
                        sendCarnivalEmail(team.leader.email, `⚠️ Alert: Danger Status Triggered (Attendance Rule) - Team ${team.teamName}`, html);
                    });
                }
                flaggedTeams.push({
                    id: team._id.toString(),
                    name: team.teamName,
                    reason,
                    status: 'Danger',
                });
            }
        }
    }
    return reply.send({
        message: `Attendance Auto-Checker completed! Evaluated ${teams.length} teams. Flagged ${flaggedTeams.length} teams as 'In Danger'. ⚠️`,
        totalEvaluated: teams.length,
        flaggedCount: flaggedTeams.length,
        flaggedTeams,
    });
}
