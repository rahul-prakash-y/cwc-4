"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTeams = getAllTeams;
exports.updateTeamStatus = updateTeamStatus;
exports.eliminateTeam = eliminateTeam;
exports.createTask = createTask;
exports.getAllTasksAdmin = getAllTasksAdmin;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
exports.createAnnouncement = createAnnouncement;
exports.getAllAnnouncementsAdmin = getAllAnnouncementsAdmin;
exports.deleteAnnouncement = deleteAnnouncement;
exports.grantAdvantage = grantAdvantage;
exports.setTeamImmunity = setTeamImmunity;
exports.updateScoresBatch = updateScoresBatch;
const Team_js_1 = require("../models/Team.js");
const Task_js_1 = require("../models/Task.js");
const Announcement_js_1 = require("../models/Announcement.js");
const Score_js_1 = require("../models/Score.js");
/* ==========================================================================
   TEAM MANAGEMENT CONTROLLERS
   ========================================================================== */
async function getAllTeams(_request, reply) {
    const teams = await Team_js_1.Team.find().lean();
    // Aggregate scores for each team
    const teamsWithScores = await Promise.all(teams.map(async (team) => {
        const scores = await Score_js_1.Score.find({ team: team._id });
        const totalPoints = scores.reduce((acc, curr) => acc + (curr.pointsEarned || 0), 0);
        return {
            ...team,
            totalPoints,
        };
    }));
    return reply.send({
        teams: teamsWithScores,
        count: teamsWithScores.length,
    });
}
async function updateTeamStatus(request, reply) {
    const { teamId } = request.params;
    const { status } = request.body;
    if (!['Pending', 'Approved', 'Eliminated'].includes(status)) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'Invalid status. Allowed values: Pending, Approved, Eliminated',
        });
    }
    const team = await Team_js_1.Team.findByIdAndUpdate(teamId, { status }, { new: true, runValidators: true });
    if (!team) {
        return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
    }
    return reply.send({
        message: `Team status updated to ${status} successfully! 🎪`,
        team,
    });
}
async function eliminateTeam(request, reply) {
    const { teamId } = request.params;
    const team = await Team_js_1.Team.findByIdAndUpdate(teamId, { status: 'Eliminated' }, { new: true });
    if (!team) {
        return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
    }
    return reply.send({
        message: `Team '${team.teamName}' has been eliminated.`,
        team,
    });
}
async function createTask(request, reply) {
    const { title, description, type, points, startTime, endTime, visibility = false } = request.body;
    if (!title || !type || points === undefined || !startTime || !endTime) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'Missing required fields for task creation',
        });
    }
    const newTask = await Task_js_1.Task.create({
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
async function getAllTasksAdmin(_request, reply) {
    const tasks = await Task_js_1.Task.find().sort({ startTime: 1 });
    return reply.send({ tasks });
}
async function updateTask(request, reply) {
    const { taskId } = request.params;
    const updateData = request.body;
    if (updateData.startTime)
        updateData.startTime = new Date(updateData.startTime);
    if (updateData.endTime)
        updateData.endTime = new Date(updateData.endTime);
    const updatedTask = await Task_js_1.Task.findByIdAndUpdate(taskId, updateData, {
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
async function deleteTask(request, reply) {
    const { taskId } = request.params;
    const deletedTask = await Task_js_1.Task.findByIdAndDelete(taskId);
    if (!deletedTask) {
        return reply.status(404).send({ error: 'Not Found', message: 'Task not found' });
    }
    return reply.send({
        message: 'Task deleted successfully.',
        taskId,
    });
}
async function createAnnouncement(request, reply) {
    const { message, pinned = false, author } = request.body;
    if (!message) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'Announcement message is required',
        });
    }
    const announcement = await Announcement_js_1.Announcement.create({
        message,
        pinned,
        author: author || 'Carnival Admin 🎪',
        timestamp: new Date(),
    });
    return reply.status(201).send({
        message: 'Global announcement posted! 📢',
        announcement,
    });
}
async function getAllAnnouncementsAdmin(_request, reply) {
    const announcements = await Announcement_js_1.Announcement.find().sort({ pinned: -1, createdAt: -1 });
    return reply.send({ announcements });
}
async function deleteAnnouncement(request, reply) {
    const { announcementId } = request.params;
    const deleted = await Announcement_js_1.Announcement.findByIdAndDelete(announcementId);
    if (!deleted) {
        return reply.status(404).send({ error: 'Not Found', message: 'Announcement not found' });
    }
    return reply.send({
        message: 'Announcement deleted successfully.',
        announcementId,
    });
}
async function grantAdvantage(request, reply) {
    const { teamId } = request.params;
    const { advantage, quantity = 1 } = request.body;
    if (!advantage) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'Advantage name is required (e.g. Double Points, Extra Time, Skip, Golden Coin, Hint)',
        });
    }
    const team = await Team_js_1.Team.findById(teamId);
    if (!team) {
        return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
    }
    const existingAdv = team.advantages.find((a) => a.advantage.toLowerCase() === advantage.toLowerCase());
    if (existingAdv) {
        existingAdv.quantity += quantity;
    }
    else {
        team.advantages.push({
            advantage,
            quantity,
            grantedAt: new Date(),
        });
    }
    await team.save();
    return reply.send({
        message: `Granted advantage '${advantage}' (+${quantity}) to team '${team.teamName}'! 🎁`,
        team,
    });
}
async function setTeamImmunity(request, reply) {
    const { teamId } = request.params;
    const { immunity } = request.body;
    if (typeof immunity !== 'boolean') {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'Immunity status (boolean true/false) is required',
        });
    }
    const team = await Team_js_1.Team.findByIdAndUpdate(teamId, { immunity }, { new: true });
    if (!team) {
        return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
    }
    return reply.send({
        message: `Immunity status for team '${team.teamName}' set to: ${immunity ? '🛡️ PROTECTED' : '❌ NONE'}`,
        team,
    });
}
async function updateScoresBatch(request, reply) {
    const { scores } = request.body;
    if (!Array.isArray(scores)) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'Scores must be an array of team score objects',
        });
    }
    const results = await Promise.all(scores.map(async (item) => {
        const updateData = {};
        if (item.status)
            updateData.status = item.status;
        if (item.immunity !== undefined)
            updateData.immunity = item.immunity;
        if (item.elimination)
            updateData.status = 'Eliminated';
        if (Object.keys(updateData).length > 0) {
            await Team_js_1.Team.findByIdAndUpdate(item.teamId, updateData);
        }
        let taskDoc = await Task_js_1.Task.findOne({ type: 'Main Task' });
        if (!taskDoc) {
            taskDoc = await Task_js_1.Task.findOne();
        }
        if (taskDoc && item.teamId) {
            const totalPoints = (item.mainTaskScore || 0) + (item.specialTaskScore || 0);
            await Score_js_1.Score.findOneAndUpdate({ team: item.teamId, task: taskDoc._id }, {
                pointsEarned: totalPoints,
                advantagesUsed: item.advantage ? [item.advantage] : [],
                immunityStatus: item.immunity || false,
            }, { upsert: true, new: true });
        }
        return { teamId: item.teamId, success: true };
    }));
    return reply.send({
        message: 'Batch score sheet updated successfully! 📊',
        updatedCount: results.length,
        results,
    });
}
