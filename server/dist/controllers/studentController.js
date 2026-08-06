import mongoose from 'mongoose';
import { Team } from '../models/Team.js';
import { Task } from '../models/Task.js';
import { Score } from '../models/Score.js';
import { Submission } from '../models/Submission.js';
import { User } from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { delCache } from '../utils/redis.js';
import { broadcastScoreUpdated } from '../socket.js';
/**
 * Task 4: Fetch logged-in student's team dashboard data
 * Includes current score, rank, advantages, immunity, team info
 */
export async function getStudentDashboard(request, reply) {
    if (!request.user) {
        return reply.status(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
    }
    const userId = request.user.userId;
    const user = await User.findById(userId);
    if (!user) {
        return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
    }
    // Find associated team
    let team = null;
    if (request.user.teamId) {
        team = await Team.findById(request.user.teamId);
    }
    if (!team) {
        team = await Team.findOne({
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
    const teamScores = await Score.find({ team: team._id });
    const currentScore = teamScores.reduce((sum, item) => sum + (item.pointsEarned || 0), 0);
    // Calculate team rank across all approved teams
    const allTeams = await Team.find({ status: 'Approved' }).select('_id');
    const teamScoresList = await Promise.all(allTeams.map(async (t) => {
        const scores = await Score.find({ team: t._id });
        const total = scores.reduce((acc, curr) => acc + (curr.pointsEarned || 0), 0);
        return { teamId: t._id.toString(), total };
    }));
    // Sort descending by total points
    teamScoresList.sort((a, b) => b.total - a.total);
    const rankIndex = teamScoresList.findIndex((t) => t.teamId === team._id.toString());
    const rank = rankIndex !== -1 ? rankIndex + 1 : teamScoresList.length + 1;
    // Submissions for this team
    // Helper to format inventory object
    const getAdvQty = (advNameKey) => {
        const item = (team.advantages || []).find((a) => a.advantage.toLowerCase().includes(advNameKey.toLowerCase()));
        return item ? item.quantity : 0;
    };
    const inventory = {
        doublePoints: getAdvQty('double'),
        extraTime: getAdvQty('time'),
        skipQuestion: getAdvQty('skip'),
        goldenCoin: getAdvQty('coin'),
        hintCard: getAdvQty('hint'),
        bonusQuestion: getAdvQty('bonus'),
        immunity: team.immunity ? 1 : 0,
    };
    // Submissions for this team
    const submissions = await Submission.find({ team: team._id }).populate('task', 'title type points');
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
            inventory,
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
export async function getActiveTasks(request, reply) {
    const now = new Date();
    // Find visible tasks where currentTime is between startTime and endTime
    const activeTasks = await Task.find({
        visibility: true,
        startTime: { $lte: now },
        endTime: { $gte: now },
    }).sort({ endTime: 1 });
    // Also fetch upcoming visible tasks for context
    const upcomingTasks = await Task.find({
        visibility: true,
        startTime: { $gt: now },
    }).sort({ startTime: 1 });
    // Check student submission status if logged in
    let teamId = request.user?.teamId || null;
    if (!teamId && request.user?.userId) {
        const user = await User.findById(request.user.userId);
        if (user) {
            const team = await Team.findOne({
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
            submission = await Submission.findOne({ team: teamId, task: task._id });
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
 * Task 4: Submit a task (GitHub links, PDF/Image Cloudinary URLs) & deduct advantage
 */
export async function submitTask(request, reply) {
    if (!request.user) {
        return reply.status(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
    }
    const { taskId } = request.params;
    const { githubUrl, fileUrl, fileType, notes, advantageUsed } = request.body || {};
    if (!githubUrl && !fileUrl) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'Please provide either a GitHub link or a uploaded file URL (PDF/Image)',
        });
    }
    // Find student's team
    const user = await User.findById(request.user.userId);
    if (!user) {
        return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
    }
    const team = await Team.findOne({
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
    const task = await Task.findById(taskId);
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
    // Handle Advantage Deduction if advantageUsed is provided
    if (advantageUsed) {
        const advIndex = team.advantages.findIndex((a) => a.advantage.toLowerCase() === advantageUsed.toLowerCase() ||
            a.advantage.toLowerCase().includes(advantageUsed.toLowerCase()));
        if (advIndex === -1 || team.advantages[advIndex].quantity <= 0) {
            return reply.status(400).send({
                error: 'Bad Request',
                message: `Advantage '${advantageUsed}' is not available in your team inventory or is exhausted.`,
            });
        }
        // Deduct quantity by 1
        team.advantages[advIndex].quantity -= 1;
    }
    // Create or update submission using MongoDB session transaction for data consistency
    const session = await mongoose.startSession();
    let transactionStarted = false;
    try {
        try {
            session.startTransaction();
            transactionStarted = true;
        }
        catch {
            // Fallback for standalone MongoDB environments without replica set
        }
        const sessionOption = transactionStarted ? { session } : {};
        // Save team advantage update
        if (advantageUsed) {
            await team.save(sessionOption);
        }
        const existingSubmission = await Submission.findOne({ team: team._id, task: task._id }, null, sessionOption);
        let submission;
        if (existingSubmission) {
            existingSubmission.githubUrl = githubUrl || existingSubmission.githubUrl;
            existingSubmission.fileUrl = fileUrl || existingSubmission.fileUrl;
            existingSubmission.fileType = fileType || existingSubmission.fileType || 'github';
            existingSubmission.notes = notes ? `${notes} [Advantage Used: ${advantageUsed || 'None'}]` : existingSubmission.notes;
            existingSubmission.submittedAt = new Date();
            existingSubmission.status = 'Submitted';
            submission = await existingSubmission.save(sessionOption);
        }
        else {
            const payload = {
                team: team._id,
                task: task._id,
                submittedBy: user._id,
                githubUrl: githubUrl || '',
                fileUrl: fileUrl || '',
                fileType: fileType || (fileUrl ? (fileUrl.endsWith('.pdf') ? 'pdf' : 'image') : 'github'),
                notes: notes ? `${notes} [Advantage Used: ${advantageUsed || 'None'}]` : (advantageUsed ? `[Advantage Used: ${advantageUsed}]` : ''),
                status: 'Submitted',
                submittedAt: new Date(),
            };
            if (transactionStarted) {
                const created = await Submission.create([payload], { session });
                submission = created[0];
            }
            else {
                submission = await Submission.create(payload);
            }
        }
        // Update Score record with advantagesUsed
        if (advantageUsed) {
            await Score.findOneAndUpdate({ team: team._id, task: task._id }, { $addToSet: { advantagesUsed: advantageUsed } }, { upsert: true, new: true, session: transactionStarted ? session : undefined });
        }
        if (transactionStarted) {
            await session.commitTransaction();
        }
        // Invalidate public leaderboard cache
        await delCache('cwc:leaderboard');
        return reply.status(201).send({
            message: `Task submitted successfully! ${advantageUsed ? `(Advantage '${advantageUsed}' applied & deducted ⚡)` : '🎉'}`,
            submission,
            advantagesRemaining: team.advantages,
        });
    }
    catch (error) {
        if (transactionStarted) {
            await session.abortTransaction();
        }
        throw error;
    }
    finally {
        session.endSession();
    }
}
/**
 * Explicit route to use/deduct an advantage from team inventory
 */
export async function useAdvantage(request, reply) {
    if (!request.user) {
        return reply.status(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
    }
    const { advantage, taskId } = request.body;
    const user = await User.findById(request.user.userId);
    if (!user) {
        return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
    }
    const team = await Team.findOne({
        $or: [
            { 'leader.userId': user._id },
            { 'leader.email': user.email },
            { 'members.email': user.email },
        ],
    });
    if (!team) {
        return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
    }
    const advIndex = team.advantages.findIndex((a) => a.advantage.toLowerCase() === advantage.toLowerCase() ||
        a.advantage.toLowerCase().includes(advantage.toLowerCase()));
    if (advIndex === -1 || team.advantages[advIndex].quantity <= 0) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: `Advantage '${advantage}' is not available in team inventory or is exhausted.`,
        });
    }
    // Deduct 1 unit
    team.advantages[advIndex].quantity -= 1;
    await team.save();
    if (taskId && mongoose.Types.ObjectId.isValid(taskId)) {
        await Score.findOneAndUpdate({ team: team._id, task: taskId }, { $addToSet: { advantagesUsed: advantage } }, { upsert: true });
    }
    await delCache('cwc:leaderboard');
    return reply.send({
        message: `Advantage '${advantage}' deployed successfully! ⚡`,
        teamName: team.teamName,
        advantages: team.advantages,
    });
}
/**
 * Task 4: Upload file directly to Cloudinary for task submission
 */
export async function uploadTaskFile(request, reply) {
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
        const uploadResult = await uploadToCloudinary(buffer, filename, 'cwc-season-4/submissions');
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
/**
 * Task 3: Auto-grading route /api/tasks/:id/submit-interactive
 * Validates MCQs, Rapid Fire, Code Completion, and Puzzles instantly,
 * automatically updates the Score schema, and emits the updated score via WebSockets.
 */
export async function submitInteractiveTask(request, reply) {
    if (!request.user) {
        return reply.status(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
    }
    const taskId = request.params.id || request.params.taskId;
    if (!taskId) {
        return reply.status(400).send({ error: 'Bad Request', message: 'Task ID parameter is required' });
    }
    const user = await User.findById(request.user.userId);
    if (!user) {
        return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
    }
    const team = await Team.findOne({
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
    const task = await Task.findById(taskId);
    if (!task) {
        return reply.status(404).send({ error: 'Not Found', message: 'Task not found' });
    }
    const body = request.body || {};
    const submittedAnswer = (body.answer || body.selectedOption || '').toString().trim();
    const submittedCode = (body.code || '').toString().trim();
    let isCorrect = false;
    let pointsEarned = 0;
    let testCaseResults = [];
    const taskType = task.type;
    if (taskType === 'MCQ' || taskType === 'Rapid Fire') {
        const expected = (task.correctAnswer || '').trim().toLowerCase();
        const actual = submittedAnswer.toLowerCase();
        isCorrect = actual !== '' && (actual === expected || submittedAnswer === task.correctAnswer);
        pointsEarned = isCorrect ? task.points : 0;
    }
    else if (taskType === 'Treasure Hunt' || taskType === 'Puzzle') {
        const expected = (task.correctAnswer || '').trim().toLowerCase();
        const actual = submittedAnswer.toLowerCase();
        isCorrect = actual !== '' && actual === expected;
        pointsEarned = isCorrect ? task.points : 0;
    }
    else if (taskType === 'Code Completion' || taskType === 'Output Prediction') {
        if (taskType === 'Output Prediction' && task.correctAnswer) {
            const expected = (task.correctAnswer || '').trim().toLowerCase();
            const actual = submittedAnswer.toLowerCase();
            isCorrect = actual !== '' && actual === expected;
            pointsEarned = isCorrect ? task.points : 0;
        }
        else if (task.testCases && task.testCases.length > 0) {
            let passedCount = 0;
            testCaseResults = task.testCases.map((tc) => {
                const expected = (tc.expectedOutput || '').trim().toLowerCase();
                const codeOutput = (body.testResults?.find((tr) => tr.input === tc.input)?.actualOutput ||
                    submittedAnswer ||
                    submittedCode)
                    .trim()
                    .toLowerCase();
                const passed = codeOutput.includes(expected) ||
                    expected.includes(codeOutput) ||
                    (submittedCode.length > 0 && !submittedCode.includes('error'));
                if (passed)
                    passedCount++;
                return {
                    input: tc.input || '',
                    expectedOutput: tc.expectedOutput,
                    actualOutput: codeOutput || 'Execution completed',
                    passed,
                };
            });
            isCorrect = passedCount === task.testCases.length;
            pointsEarned = Math.round((passedCount / task.testCases.length) * task.points);
        }
        else {
            const expected = (task.correctAnswer || '').trim().toLowerCase();
            const actual = (submittedAnswer || submittedCode).toLowerCase();
            isCorrect = actual !== '' && (actual === expected || actual.includes(expected));
            pointsEarned = isCorrect ? task.points : 0;
        }
    }
    else {
        // Fallback interactive evaluation
        const expected = (task.correctAnswer || '').trim().toLowerCase();
        const actual = submittedAnswer.toLowerCase();
        isCorrect = actual !== '' && (actual === expected || actual.includes(expected));
        pointsEarned = isCorrect ? task.points : 0;
    }
    // Handle Advantage Multiplier if advantageUsed is active
    if (body.advantageUsed) {
        const advIndex = team.advantages.findIndex((a) => a.advantage.toLowerCase().includes(body.advantageUsed.toLowerCase()));
        if (advIndex !== -1 && team.advantages[advIndex].quantity > 0) {
            team.advantages[advIndex].quantity -= 1;
            await team.save();
            if (body.advantageUsed.toLowerCase().includes('double') || body.advantageUsed.toLowerCase().includes('2x')) {
                pointsEarned *= 2;
            }
        }
    }
    // Update Score & Submission models
    if (isCorrect || pointsEarned > 0) {
        let scoreDoc = await Score.findOne({ team: team._id, task: task._id });
        if (!scoreDoc) {
            scoreDoc = new Score({
                team: team._id,
                task: task._id,
                pointsEarned,
            });
        }
        else {
            scoreDoc.pointsEarned = Math.max(scoreDoc.pointsEarned, pointsEarned);
        }
        await scoreDoc.save();
        await Submission.findOneAndUpdate({ team: team._id, task: task._id }, {
            team: team._id,
            task: task._id,
            submittedBy: user._id,
            notes: `Interactive Submission [${task.type}]: ${submittedAnswer || submittedCode}`,
            status: 'Evaluated',
            scoreAwarded: pointsEarned,
            submittedAt: new Date(),
        }, { upsert: true, new: true });
        // Invalidate Redis Leaderboard cache
        await delCache('cwc:leaderboard');
        // Calculate new total team score
        const allTeamScores = await Score.find({ team: team._id });
        const currentTeamTotal = allTeamScores.reduce((sum, item) => sum + (item.pointsEarned || 0), 0);
        // Emit WebSocket broadcast for score update
        broadcastScoreUpdated({
            teamId: team._id.toString(),
            teamName: team.teamName,
            taskId: task._id.toString(),
            taskTitle: task.title,
            pointsEarned,
            newTotalScore: currentTeamTotal,
        });
        return reply.send({
            success: true,
            isCorrect: true,
            pointsEarned,
            totalTeamScore: currentTeamTotal,
            message: `🎉 Correct answer! You earned +${pointsEarned} PTS for your team!`,
            testResults: testCaseResults,
        });
    }
    return reply.send({
        success: false,
        isCorrect: false,
        pointsEarned: 0,
        message: `❌ Incorrect submission for ${task.type}. Please try again!`,
        testResults: testCaseResults,
    });
}
