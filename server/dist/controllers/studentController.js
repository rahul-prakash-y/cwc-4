"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentDashboard = getStudentDashboard;
exports.getActiveTasks = getActiveTasks;
exports.submitTask = submitTask;
exports.uploadTaskFile = uploadTaskFile;
const Team_js_1 = require("../models/Team.js");
const Task_js_1 = require("../models/Task.js");
const Score_js_1 = require("../models/Score.js");
const Submission_js_1 = require("../models/Submission.js");
const User_js_1 = require("../models/User.js");
const cloudinary_js_1 = require("../utils/cloudinary.js");
/**
 * Task 4: Fetch logged-in student's team dashboard data
 * Includes current score, rank, advantages, immunity, team info
 */
async function getStudentDashboard(request, reply) {
    if (!request.user) {
        return reply.status(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
    }
    const userId = request.user.userId;
    const user = await User_js_1.User.findById(userId);
    if (!user) {
        return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
    }
    // Find associated team
    let team = null;
    if (request.user.teamId) {
        team = await Team_js_1.Team.findById(request.user.teamId);
    }
    if (!team) {
        team = await Team_js_1.Team.findOne({
            $or: [
                { 'leader.userId': user._id },
                { 'leader.email': user.email },
                { 'members.email': user.email },
            ],
        });
    }
    if (!team) {
        return reply.status(404).send({
            error: 'Not Found',
            message: 'No team registration found for this user account.',
        });
    }
    // Calculate current team score
    const teamScores = await Score_js_1.Score.find({ team: team._id });
    const currentScore = teamScores.reduce((sum, item) => sum + (item.pointsEarned || 0), 0);
    // Calculate team rank across all approved teams
    const allTeams = await Team_js_1.Team.find({ status: 'Approved' }).select('_id');
    const teamScoresList = await Promise.all(allTeams.map(async (t) => {
        const scores = await Score_js_1.Score.find({ team: t._id });
        const total = scores.reduce((acc, curr) => acc + (curr.pointsEarned || 0), 0);
        return { teamId: t._id.toString(), total };
    }));
    // Sort descending by total points
    teamScoresList.sort((a, b) => b.total - a.total);
    const rankIndex = teamScoresList.findIndex((t) => t.teamId === team._id.toString());
    const rank = rankIndex !== -1 ? rankIndex + 1 : teamScoresList.length + 1;
    // Submissions for this team
    const submissions = await Submission_js_1.Submission.find({ team: team._id }).populate('task', 'title type points');
    return reply.send({
        team: {
            id: team._id,
            teamName: team.teamName,
            status: team.status,
            themeColor: team.themeColor,
            logoUrl: team.logoUrl,
            leader: team.leader,
            members: team.members,
            advantages: team.advantages || [],
            immunity: team.immunity || false,
            currentScore,
            rank,
            totalTeams: allTeams.length,
        },
        submissions,
    });
}
/**
 * Task 4: Fetch active tasks based on current time
 */
async function getActiveTasks(request, reply) {
    const now = new Date();
    // Find visible tasks where currentTime is between startTime and endTime
    const activeTasks = await Task_js_1.Task.find({
        visibility: true,
        startTime: { $lte: now },
        endTime: { $gte: now },
    }).sort({ endTime: 1 });
    // Also fetch upcoming visible tasks for context
    const upcomingTasks = await Task_js_1.Task.find({
        visibility: true,
        startTime: { $gt: now },
    }).sort({ startTime: 1 });
    // Check student submission status if logged in
    let teamId = request.user?.teamId || null;
    if (!teamId && request.user?.userId) {
        const user = await User_js_1.User.findById(request.user.userId);
        if (user) {
            const team = await Team_js_1.Team.findOne({
                $or: [{ 'leader.userId': user._id }, { 'leader.email': user.email }],
            });
            if (team)
                teamId = team._id.toString();
        }
    }
    const tasksWithSubmission = await Promise.all(activeTasks.map(async (task) => {
        const taskObj = task.toObject();
        let submission = null;
        if (teamId) {
            submission = await Submission_js_1.Submission.findOne({ team: teamId, task: task._id });
        }
        return {
            ...taskObj,
            isSubmitted: !!submission,
            submissionStatus: submission ? submission.status : 'Pending',
            submissionDetails: submission,
        };
    }));
    return reply.send({
        currentTime: now.toISOString(),
        activeTasks: tasksWithSubmission,
        activeCount: tasksWithSubmission.length,
        upcomingTasks,
    });
}
/**
 * Task 4: Submit a task (GitHub links, PDF/Image Cloudinary URLs)
 */
async function submitTask(request, reply) {
    if (!request.user) {
        return reply.status(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
    }
    const { taskId } = request.params;
    const { githubUrl, fileUrl, fileType, notes } = request.body || {};
    if (!githubUrl && !fileUrl) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'Please provide either a GitHub link or a uploaded file URL (PDF/Image)',
        });
    }
    // Find student's team
    const user = await User_js_1.User.findById(request.user.userId);
    if (!user) {
        return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
    }
    const team = await Team_js_1.Team.findOne({
        $or: [
            { 'leader.userId': user._id },
            { 'leader.email': user.email },
            { 'members.email': user.email },
        ],
    });
    if (!team) {
        return reply.status(404).send({
            error: 'Not Found',
            message: 'You are not registered in any team.',
        });
    }
    if (team.status !== 'Approved') {
        return reply.status(403).send({
            error: 'Forbidden',
            message: `Your team status is '${team.status}'. Only 'Approved' teams can submit tasks.`,
        });
    }
    // Verify task exists and is active
    const task = await Task_js_1.Task.findById(taskId);
    if (!task) {
        return reply.status(404).send({ error: 'Not Found', message: 'Task not found' });
    }
    const now = new Date();
    if (!task.visibility || now < task.startTime || now > task.endTime) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'This task is not currently open for submission.',
        });
    }
    // Create or update submission
    const existingSubmission = await Submission_js_1.Submission.findOne({ team: team._id, task: task._id });
    let submission;
    if (existingSubmission) {
        existingSubmission.githubUrl = githubUrl || existingSubmission.githubUrl;
        existingSubmission.fileUrl = fileUrl || existingSubmission.fileUrl;
        existingSubmission.fileType = fileType || existingSubmission.fileType || 'github';
        existingSubmission.notes = notes || existingSubmission.notes;
        existingSubmission.submittedAt = new Date();
        existingSubmission.status = 'Submitted';
        submission = await existingSubmission.save();
    }
    else {
        submission = await Submission_js_1.Submission.create({
            team: team._id,
            task: task._id,
            submittedBy: user._id,
            githubUrl: githubUrl || '',
            fileUrl: fileUrl || '',
            fileType: fileType || (fileUrl ? (fileUrl.endsWith('.pdf') ? 'pdf' : 'image') : 'github'),
            notes: notes || '',
            status: 'Submitted',
            submittedAt: new Date(),
        });
    }
    return reply.status(201).send({
        message: 'Task submitted successfully! 🎉',
        submission,
    });
}
/**
 * Task 4: Upload file directly to Cloudinary for task submission
 */
async function uploadTaskFile(request, reply) {
    const data = await request.file();
    if (!data) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'No file uploaded',
        });
    }
    const buffer = await data.toBuffer();
    const filename = data.filename || 'submission_file';
    try {
        const uploadResult = await (0, cloudinary_js_1.uploadToCloudinary)(buffer, filename, 'cwc-season-4/submissions');
        return reply.send({
            message: 'File uploaded to Cloudinary successfully! ☁️',
            url: uploadResult.url,
            publicId: uploadResult.public_id,
            format: uploadResult.format,
        });
    }
    catch (error) {
        return reply.status(500).send({
            error: 'Internal Server Error',
            message: error.message || 'Cloudinary upload failed',
        });
    }
}
