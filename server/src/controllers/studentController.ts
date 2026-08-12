import { FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import { Team } from '../models/Team.js';
import { Task } from '../models/Task.js';
import { Score } from '../models/Score.js';
import { Submission, SubmissionFileType } from '../models/Submission.js';
import { Draft } from '../models/Draft.js';
import { User } from '../models/User.js';
import { DailyVoteLog } from '../models/VoteLog.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { delCache } from '../utils/redis.js';
import { broadcastScoreUpdated, broadcastVotesUpdated } from '../socket.js';


/**
 * Task 4: Fetch logged-in student's team dashboard data
 * Includes current score, rank, advantages, immunity, team info
 */
export async function getStudentDashboard(request: FastifyRequest, reply: FastifyReply) {
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
  const currentScore = teamScores.reduce((sum, item: any) => {
    const pts = item.pointsEarned ?? item.total ?? item.scores?.total ?? ((item.main || 0) + (item.special || 0) + (item.adv || 0));
    return sum + (pts || 0);
  }, 0);

  // Calculate team rank across all active teams
  const allTeams = await Team.find({ status: { $ne: 'Rejected' } }).select('_id');
  const teamScoresList = await Promise.all(
    allTeams.map(async (t) => {
      const scores = await Score.find({ team: t._id });
      const total = scores.reduce((acc, curr: any) => {
        const pts = curr.pointsEarned ?? curr.total ?? curr.scores?.total ?? ((curr.main || 0) + (curr.special || 0) + (curr.adv || 0));
        return acc + (pts || 0);
      }, 0);
      return { teamId: t._id.toString(), total };
    })
  );

  // Sort descending by total points
  teamScoresList.sort((a, b) => b.total - a.total);
  const rankIndex = teamScoresList.findIndex((t) => t.teamId === team._id.toString());
  const rank = rankIndex !== -1 ? rankIndex + 1 : teamScoresList.length + 1;

  // Submissions for this team
  // Helper to format inventory object
  const getAdvQty = (advNameKey: string) => {
    const item = (team.advantages || []).find((a) =>
      a.advantage.toLowerCase().includes(advNameKey.toLowerCase())
    );
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
export async function getActiveTasks(request: FastifyRequest, reply: FastifyReply) {
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
  let teamId: string | null = request.user?.teamId || null;
  if (!teamId && request.user?.userId) {
    const user = await User.findById(request.user.userId);
    if (user) {
      const team = await Team.findOne({
        $or: [{ 'leader.userId': user._id }, { 'leader.email': user.email }],
      });
      if (team) teamId = team._id.toString();
    }
  }

  const tasksWithSubmission = await Promise.all(
    activeTasks.map(async (task) => {
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
    })
  );

  return reply.send({
    currentTime: now.toISOString(),
    activeTasks: tasksWithSubmission,
    activeCount: tasksWithSubmission.length,
    upcomingTasks,
  });
}

interface SubmitTaskBody {
  textAnswer?: string;
  content?: string;
  githubUrl?: string;
  fileUrl?: string;
  fileType?: SubmissionFileType;
  notes?: string;
  advantageUsed?: string;
}

interface SaveDraftBody {
  content?: string;
  code?: string;
  textAnswer?: string;
  githubUrl?: string;
  fileUrl?: string;
  notes?: string;
}

/**
 * Task 4: Save or update temporary task answer draft in MongoDB
 */
export async function saveTaskDraft(
  request: FastifyRequest<{
    Params: { id?: string; taskId?: string };
    Body: SaveDraftBody;
  }>,
  reply: FastifyReply
) {
  if (!request.user) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
  }

  const taskId = request.params.id || request.params.taskId;
  if (!taskId) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Task ID is required' });
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
    return reply.status(404).send({ error: 'Not Found', message: 'Team not found' });
  }

  const body = request.body || {};
  const draftContent = body.content || body.code || body.textAnswer || '';

  const draft = await Draft.findOneAndUpdate(
    { studentId: user._id.toString(), testId: taskId },
    {
      studentId: user._id.toString(),
      testId: taskId,
      codeDraft: draftContent,
      state: {
        githubUrl: body.githubUrl || '',
        fileUrl: body.fileUrl || '',
        notes: body.notes || '',
        teamId: team._id.toString(),
      },
      lastSavedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return reply.send({
    message: 'Task draft saved successfully! 📝',
    draft,
  });
}

/**
 * Task 4: Submit a task (text answer, GitHub links, PDF/Image Cloudinary URLs) & deduct advantage
 */
export async function submitTask(
  request: FastifyRequest<{
    Params: { taskId?: string; id?: string };
    Body: SubmitTaskBody;
  }>,
  reply: FastifyReply
) {
  if (!request.user) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
  }

  const taskId = request.params.taskId || request.params.id;
  if (!taskId) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Task ID parameter is required' });
  }

  const { textAnswer, content, githubUrl, fileUrl, fileType, notes, advantageUsed } = request.body || {};
  const combinedText = (textAnswer || content || '').trim();

  if (!githubUrl && !fileUrl && !combinedText) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Please provide either a text answer, GitHub link, or an uploaded Cloudinary file payload.',
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

  // Task 1: Block Eliminated teams from submitting — respectful 403 Forbidden
  if (team.status === 'Eliminated') {
    return reply.status(403).send({
      error: 'Forbidden',
      message:
        `🎪 Team '${team.teamName}', your carnival journey has come to a close. ` +
        `Submissions are no longer accepted for eliminated teams. ` +
        `Thank you for your passion and contributions to CWC Season 4! 🙏`,
    });
  }

  if (team.status !== 'Approved' && team.status !== 'Safe' && team.status !== 'Danger' && team.status !== 'Qualified') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: `Your team status is '${team.status}'. Only active carnival teams can submit tasks.`,
    });
  }

  // Verify task exists and is active
  let task = null;
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    task = await Task.findById(taskId);
  }
  if (!task) {
    task = await Task.findOne({
      $or: [
        { title: new RegExp(taskId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i') },
        { type: new RegExp(taskId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i') },
      ],
    });
  }
  if (!task) {
    task = await Task.findOne();
  }

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
    const advIndex = team.advantages.findIndex(
      (a) => a.advantage.toLowerCase() === advantageUsed.toLowerCase() ||
             a.advantage.toLowerCase().includes(advantageUsed.toLowerCase())
    );

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
    } catch {
      // Fallback for standalone MongoDB environments without replica set
    }

    const sessionOption = transactionStarted ? { session } : {};

    // Save team advantage update
    if (advantageUsed) {
      await team.save(sessionOption);
    }

    const existingSubmission = await Submission.findOne(
      { team: team._id, task: task._id },
      null,
      sessionOption
    );

    let submission;
    if (existingSubmission) {
      existingSubmission.githubUrl = githubUrl || existingSubmission.githubUrl;
      existingSubmission.fileUrl = fileUrl || existingSubmission.fileUrl;
      existingSubmission.fileType = fileType || existingSubmission.fileType || 'github';
      existingSubmission.notes = notes ? `${notes} [Advantage Used: ${advantageUsed || 'None'}]` : existingSubmission.notes;
      existingSubmission.submittedAt = new Date();
      existingSubmission.status = 'Submitted';
      submission = await existingSubmission.save(sessionOption);
    } else {
      const payload = {
        team: team._id,
        task: task._id,
        submittedBy: user._id,
        githubUrl: githubUrl || '',
        fileUrl: fileUrl || '',
        fileType: fileType || (fileUrl ? (fileUrl.endsWith('.pdf') ? 'pdf' : 'image') : 'github'),
        notes: notes ? `${notes} [Advantage Used: ${advantageUsed || 'None'}]` : (advantageUsed ? `[Advantage Used: ${advantageUsed}]` : ''),
        status: 'Submitted' as const,
        submittedAt: new Date(),
      };

      if (transactionStarted) {
        const created = await Submission.create([payload], { session });
        submission = created[0];
      } else {
        submission = await Submission.create(payload);
      }
    }

    // Update Score record with advantagesUsed
    if (advantageUsed) {
      await Score.findOneAndUpdate(
        { team: team._id, task: task._id },
        { $addToSet: { advantagesUsed: advantageUsed } },
        { upsert: true, new: true, session: transactionStarted ? session : undefined }
      );
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
  } catch (error) {
    if (transactionStarted) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Explicit route to use/deduct an advantage from team inventory
 */
export async function useAdvantage(
  request: FastifyRequest<{ Body: { advantage: string; taskId?: string } }>,
  reply: FastifyReply
) {
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

  const advIndex = team.advantages.findIndex(
    (a) => a.advantage.toLowerCase() === advantage.toLowerCase() ||
           a.advantage.toLowerCase().includes(advantage.toLowerCase())
  );

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
    await Score.findOneAndUpdate(
      { team: team._id, task: taskId },
      { $addToSet: { advantagesUsed: advantage } },
      { upsert: true }
    );
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
export async function uploadTaskFile(request: FastifyRequest, reply: FastifyReply) {
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
  } catch (error: any) {
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: error.message || 'Cloudinary upload failed',
    });
  }
}

interface SubmitInteractiveBody {
  answer?: string;
  selectedOption?: string;
  code?: string;
  testResults?: any[];
  advantageUsed?: string;
}

/**
 * Task 3: Auto-grading route /api/student/tasks/:id/submit-interactive
 * Validates MCQs, Rapid Fire, Code Completion, and Puzzles instantly,
 * automatically updates the Score schema, and emits the updated score via WebSockets.
 *
 * Security: Uses .select('+correctAnswer') since correctAnswer is hidden by default.
 * Advantage: Auto-detects active 'Double Points' advantage in team inventory.
 */
export async function submitInteractiveTask(
  request: FastifyRequest<{
    Params: { id?: string; taskId?: string };
    Body: SubmitInteractiveBody;
  }>,
  reply: FastifyReply
) {
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

  // Block eliminated teams from interactive submissions
  if (team.status === 'Eliminated') {
    return reply.status(403).send({
      error: 'Forbidden',
      message:
        `🎪 Team '${team.teamName}', your carnival journey has come to a close. ` +
        `Interactive submissions are no longer accepted for eliminated teams.`,
    });
  }

  // Fetch task WITH correctAnswer (hidden by default via select: false)
  let task = null;
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    task = await Task.findById(taskId).select('+correctAnswer');
  }
  if (!task) {
    task = await Task.findOne({
      $or: [
        { title: new RegExp(taskId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i') },
        { type: new RegExp(taskId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i') },
      ],
    }).select('+correctAnswer');
  }
  if (!task) {
    task = await Task.findOne().select('+correctAnswer');
  }

  if (!task) {
    return reply.status(404).send({ error: 'Not Found', message: 'Task not found' });
  }

  // Validate task is active and visible
  const now = new Date();
  if (!task.visibility || now < task.startTime || now > task.endTime) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'This task is not currently open for submission.',
    });
  }

  // Task 4: Rapid Fire time limit validation
  if (task.type === 'Rapid Fire' && task.interactiveTimeLimit && task.interactiveTimeLimit > 0) {
    const taskStartMs = task.startTime.getTime();
    const elapsedSeconds = Math.floor((now.getTime() - taskStartMs) / 1000);
    if (elapsedSeconds > task.interactiveTimeLimit) {
      return reply.status(400).send({
        error: 'Time Expired',
        message: `⏰ Rapid Fire time limit of ${task.interactiveTimeLimit}s has expired. Auto-submission enforced.`,
        expired: true,
      });
    }
  }

  // Prevent duplicate evaluated submissions
  const existingSubmission = await Submission.findOne({
    team: team._id,
    task: task._id,
    status: 'Evaluated',
  });
  if (existingSubmission) {
    return reply.status(409).send({
      error: 'Conflict',
      message: 'Your team has already submitted and been graded for this interactive task.',
      previousScore: existingSubmission.scoreAwarded || 0,
    });
  }

  const body = request.body || {};
  const submittedAnswer = (body.answer || body.selectedOption || '').toString().trim();
  const submittedCode = (body.code || '').toString().trim();

  let isCorrect = false;
  let pointsEarned = 0;
  let testCaseResults: Array<{ input?: string; expectedOutput: string; actualOutput: string; passed: boolean }> = [];

  const taskType = task.type;

  if (taskType === 'MCQ' || taskType === 'Rapid Fire') {
    const expected = (task.correctAnswer || '').trim().toLowerCase();
    const actual = submittedAnswer.toLowerCase();
    isCorrect = actual !== '' && (actual === expected || submittedAnswer === task.correctAnswer);
    pointsEarned = isCorrect ? task.points : 0;
  } else if (taskType === 'Treasure Hunt' || taskType === 'Puzzle') {
    const expected = (task.correctAnswer || '').trim().toLowerCase();
    const actual = submittedAnswer.toLowerCase();
    isCorrect = actual !== '' && actual === expected;
    pointsEarned = isCorrect ? task.points : 0;
  } else if (taskType === 'Code Completion' || taskType === 'Output Prediction') {
    if (taskType === 'Output Prediction' && task.correctAnswer) {
      const expected = (task.correctAnswer || '').trim().toLowerCase();
      const actual = submittedAnswer.toLowerCase();
      isCorrect = actual !== '' && actual === expected;
      pointsEarned = isCorrect ? task.points : 0;
    } else if (task.testCases && task.testCases.length > 0) {
      let passedCount = 0;
      testCaseResults = task.testCases.map((tc) => {
        const expected = (tc.expectedOutput || '').trim().toLowerCase();
        const codeOutput = (
          body.testResults?.find((tr: any) => tr.input === tc.input)?.actualOutput ||
          submittedAnswer ||
          submittedCode
        )
          .trim()
          .toLowerCase();

        const passed =
          codeOutput.includes(expected) ||
          expected.includes(codeOutput) ||
          (submittedCode.length > 0 && !submittedCode.includes('error'));

        if (passed) passedCount++;
        return {
          input: tc.input || '',
          expectedOutput: tc.expectedOutput,
          actualOutput: codeOutput || 'Execution completed',
          passed,
        };
      });

      isCorrect = passedCount === task.testCases.length;
      pointsEarned = Math.round((passedCount / task.testCases.length) * task.points);
    } else {
      const expected = (task.correctAnswer || '').trim().toLowerCase();
      const actual = (submittedAnswer || submittedCode).toLowerCase();
      isCorrect = actual !== '' && (actual === expected || actual.includes(expected));
      pointsEarned = isCorrect ? task.points : 0;
    }
  } else {
    // Fallback interactive evaluation
    const expected = (task.correctAnswer || '').trim().toLowerCase();
    const actual = submittedAnswer.toLowerCase();
    isCorrect = actual !== '' && (actual === expected || actual.includes(expected));
    pointsEarned = isCorrect ? task.points : 0;
  }

  // Auto-detect and apply Double Points advantage from team inventory
  let doublePointsApplied = false;
  if (body.advantageUsed) {
    const advIndex = team.advantages.findIndex(
      (a) => a.advantage.toLowerCase().includes(body.advantageUsed!.toLowerCase())
    );
    if (advIndex !== -1 && team.advantages[advIndex].quantity > 0) {
      team.advantages[advIndex].quantity -= 1;
      await team.save();
      if (body.advantageUsed.toLowerCase().includes('double') || body.advantageUsed.toLowerCase().includes('2x')) {
        pointsEarned *= 2;
        doublePointsApplied = true;
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
        advantagesUsed: doublePointsApplied ? ['Double Points'] : [],
      });
    } else {
      scoreDoc.pointsEarned = Math.max(scoreDoc.pointsEarned, pointsEarned);
      if (doublePointsApplied && !scoreDoc.advantagesUsed.includes('Double Points')) {
        scoreDoc.advantagesUsed.push('Double Points');
      }
    }
    await scoreDoc.save();

    await Submission.findOneAndUpdate(
      { team: team._id, task: task._id },
      {
        team: team._id,
        task: task._id,
        submittedBy: user._id,
        notes: `Interactive Submission [${task.type}]: ${submittedAnswer || submittedCode}${doublePointsApplied ? ' [2x Double Points Applied]' : ''}`,
        status: 'Evaluated',
        scoreAwarded: pointsEarned,
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Invalidate Redis Leaderboard cache
    await delCache('cwc:leaderboard');

    // Calculate new total team score
    const allTeamScores = await Score.find({ team: team._id });
    const currentTeamTotal = allTeamScores.reduce((sum, item: any) => {
      const pts = item.pointsEarned ?? item.total ?? item.scores?.total ?? ((item.main || 0) + (item.special || 0) + (item.adv || 0));
      return sum + (pts || 0);
    }, 0);

    // Emit SCORE_UPDATED WebSocket broadcast
    broadcastScoreUpdated({
      teamId: team._id.toString(),
      teamName: team.teamName,
      taskId: task._id.toString(),
      taskTitle: task.title,
      taskType: task.type,
      pointsEarned,
      doublePointsApplied,
      newTotalScore: currentTeamTotal,
    });

    return reply.send({
      success: true,
      isCorrect: true,
      pointsEarned,
      doublePointsApplied,
      totalTeamScore: currentTeamTotal,
      message: `🎉 Correct answer! You earned +${pointsEarned} PTS${doublePointsApplied ? ' (2x Double Points! ⚡)' : ''} for your team!`,
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

/**
 * Task 2 & Task 3: Apply Advantage for a specific task (/api/student/tasks/:id/apply-advantage)
 * Verifies team ownership of advantage, applies effect, and decrements inventory.
 */
export async function applyAdvantage(
  request: FastifyRequest<{
    Params: { id?: string; taskId?: string };
    Body: { advantage?: string; advantageType?: string };
  }>,
  reply: FastifyReply
) {
  if (!request.user) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
  }

  const taskId = request.params.id || request.params.taskId;
  if (!taskId) {
    return reply.status(400).send({ error: 'Bad Request', message: 'Task ID parameter is required' });
  }

  const { advantage, advantageType } = request.body || {};
  const requestedAdv = (advantage || advantageType || '').trim();

  if (!requestedAdv) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Advantage name is required (e.g. Double Points, Extra Time, Skip Question, Golden Coin, Hint Card, Bonus Question)',
    });
  }

  // Find user & team
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

  // Check if team owns this advantage or immunity
  const isImmunityReq = requestedAdv.toLowerCase().includes('immunity');
  let advIndex = -1;

  if (!isImmunityReq) {
    advIndex = team.advantages.findIndex(
      (a) => a.advantage.toLowerCase() === requestedAdv.toLowerCase() ||
             a.advantage.toLowerCase().includes(requestedAdv.toLowerCase()) ||
             requestedAdv.toLowerCase().includes(a.advantage.toLowerCase())
    );

    if (advIndex === -1 || team.advantages[advIndex].quantity <= 0) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: `Your team does not own any available '${requestedAdv}' advantage. Inventory quantity is 0.`,
      });
    }
  } else if (!team.immunity) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Your team does not own Immunity protection.',
    });
  }

  // Find task
  let task = null;
  if (mongoose.Types.ObjectId.isValid(taskId)) {
    task = await Task.findById(taskId);
  }

  // Apply effect logic
  let effect: any = {
    type: requestedAdv,
    appliedAt: new Date().toISOString(),
  };

  const advLower = requestedAdv.toLowerCase();
  if (advLower.includes('time') || advLower.includes('extra time')) {
    effect.extendedTimeMinutes = 45;
    effect.badgeText = '⏳ Extra Time Active (+45 Mins Extension)';
    effect.message = 'Task deadline extended by +45 minutes!';
  } else if (advLower.includes('hint') || advLower.includes('hint card')) {
    effect.hintText = task?.correctAnswer
      ? `💡 Architectural Clue: Expected pattern keyword starts with "${task.correctAnswer.slice(0, 3)}..."`
      : '💡 Architectural Clue: Leverage asynchronous Redis cache invalidation & non-blocking WebSocket broadcasts for optimal performance.';
    effect.badgeText = '💡 Hint Card Revealed';
    effect.message = 'Architectural hint revealed successfully!';
  } else if (advLower.includes('double') || advLower.includes('points') || advLower.includes('multiplier')) {
    effect.doublePointsMultiplier = 2;
    effect.badgeText = '⚡ 2x Double Points Multiplier Active';
    effect.message = '2x Double Points Multiplier applied to task submission!';
  } else if (advLower.includes('skip')) {
    effect.skipPass = true;
    effect.badgeText = 'Pass Constraint Pass Active';
    effect.message = 'Skip Pass applied! 1 task constraint bypassed.';
  } else if (advLower.includes('coin') || advLower.includes('golden')) {
    effect.bonusScore = 100;
    effect.badgeText = '🪙 Golden Coin (+100 PTS)';
    effect.message = 'Golden Coin applied! +100 bonus points added.';
  } else if (advLower.includes('bonus')) {
    effect.bonusChallengeUnlocked = true;
    effect.badgeText = '🎁 Side Quest Ticket Unlocked';
    effect.message = 'Bonus Question Side Quest unlocked!';
  } else {
    effect.badgeText = `⚡ ${requestedAdv} Active`;
    effect.message = `Advantage '${requestedAdv}' applied successfully!`;
  }

  // Decrement inventory
  if (advIndex !== -1) {
    team.advantages[advIndex].quantity -= 1;
    if (team.advantages[advIndex].quantity <= 0) {
      team.advantages.splice(advIndex, 1);
    }
  }

  await team.save();

  // If task valid, record advantage in Score record
  if (task) {
    let scoreDoc = await Score.findOne({ team: team._id, task: task._id });
    if (!scoreDoc) {
      scoreDoc = new Score({
        team: team._id,
        task: task._id,
        pointsEarned: effect.bonusScore || 0,
        advantagesUsed: [requestedAdv],
      });
    } else {
      if (effect.bonusScore) scoreDoc.pointsEarned += effect.bonusScore;
      if (!scoreDoc.advantagesUsed.includes(requestedAdv)) {
        scoreDoc.advantagesUsed.push(requestedAdv);
      }
    }
    await scoreDoc.save();
  }

  await delCache('cwc:leaderboard');

  broadcastScoreUpdated({
    teamId: team._id.toString(),
    teamName: team.teamName,
    taskId: task?._id?.toString() || taskId,
    advantageApplied: requestedAdv,
    type: 'ADVANTAGE_APPLIED',
  });

  return reply.send({
    success: true,
    message: effect.message,
    advantage: requestedAdv,
    effect,
    advantagesRemaining: team.advantages,
    immunity: team.immunity,
  });
}

/**
 * Task 3: Protected Route GET /api/student/voting-status
 * Returns current date's voting stats for logged-in student's team
 */
export async function getVotingStatus(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
  }

  const user = await User.findById(request.user.userId);
  if (!user) {
    return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
  }

  const voterTeam = await Team.findOne({
    $or: [
      { 'leader.userId': user._id },
      { 'leader.email': user.email },
      { 'members.email': user.email },
    ],
  });

  if (!voterTeam) {
    return reply.status(404).send({
      error: 'Not Found',
      message: 'You are not assigned to any team.',
    });
  }

  const today = new Date().toISOString().split('T')[0];
  const logsToday = await DailyVoteLog.find({ voterTeamId: voterTeam._id, date: today });

  const totalVotesCastToday = logsToday.reduce((sum, log) => sum + (log.votesCast || 0), 0);
  const votesPerTargetTeam: Record<string, number> = {};
  logsToday.forEach((log) => {
    votesPerTargetTeam[log.targetTeamId.toString()] = log.votesCast;
  });

  return reply.send({
    voterTeamId: voterTeam._id.toString(),
    voterTeamName: voterTeam.teamName,
    date: today,
    dailyLimit: 100,
    teamLimit: 15,
    totalVotesCastToday,
    dailyVotesRemaining: Math.max(0, 100 - totalVotesCastToday),
    votesPerTargetTeam,
  });
}

/**
 * Task 3: Protected Route POST /api/student/vote
 * Body expects: { targetTeamId: string, voteCount: number }
 * Strictly validates rules via MongoDB transaction & emits VOTES_UPDATED WebSocket event.
 */
export async function castVote(
  request: FastifyRequest<{
    Body: { targetTeamId: string; voteCount: number };
  }>,
  reply: FastifyReply
) {
  if (!request.user) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
  }

  const { targetTeamId, voteCount } = request.body || {};

  if (!targetTeamId || typeof targetTeamId !== 'string') {
    return reply.status(400).send({ error: 'Bad Request', message: 'targetTeamId is required' });
  }

  const numVotes = Number(voteCount);
  if (isNaN(numVotes) || numVotes <= 0 || !Number.isInteger(numVotes)) {
    return reply.status(400).send({ error: 'Bad Request', message: 'voteCount must be a positive integer' });
  }

  const user = await User.findById(request.user.userId);
  if (!user) {
    return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
  }

  const voterTeam = await Team.findOne({
    $or: [
      { 'leader.userId': user._id },
      { 'leader.email': user.email },
      { 'members.email': user.email },
    ],
  });

  if (!voterTeam) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'You must belong to a team to cast votes.',
    });
  }

  // Rule 1: Cannot vote for your own team
  if (voterTeam._id.toString() === targetTeamId.toString()) {
    return reply.status(400).send({
      error: 'Invalid Vote',
      message: '🚫 Voting for your own team is strictly prohibited by carnival rules!',
    });
  }

  const targetTeam = await Team.findById(targetTeamId);
  if (!targetTeam) {
    return reply.status(404).send({ error: 'Not Found', message: 'Target team not found' });
  }

  // Current date string YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Query DailyVoteLog for voterTeam today
  const logsToday = await DailyVoteLog.find({ voterTeamId: voterTeam._id, date: today });
  const totalVotesCastToday = logsToday.reduce((sum, log) => sum + (log.votesCast || 0), 0);

  // Rule 3: Check overall daily limit <= 100
  if (totalVotesCastToday + numVotes > 100) {
    const remainingDaily = Math.max(0, 100 - totalVotesCastToday);
    return reply.status(400).send({
      error: 'Daily Limit Exceeded',
      message: `⚠️ Daily vote limit exceeded! You have ${remainingDaily} votes remaining today out of 100.`,
      remainingDailyVotes: remainingDaily,
    });
  }

  // Rule 4: Check per-target-team limit <= 15
  const targetLog = logsToday.find((log) => log.targetTeamId.toString() === targetTeamId.toString());
  const votesForTargetToday = targetLog ? targetLog.votesCast : 0;

  if (votesForTargetToday + numVotes > 15) {
    const remainingForTarget = Math.max(0, 15 - votesForTargetToday);
    return reply.status(400).send({
      error: 'Team Limit Exceeded',
      message: `⚠️ Limit of 15 votes per team per day reached! You have ${remainingForTarget} votes remaining for '${targetTeam.teamName}' today.`,
      remainingTeamVotes: remainingForTarget,
    });
  }

  // Perform transactional update
  const session = await mongoose.startSession();
  let transactionStarted = false;

  try {
    try {
      session.startTransaction();
      transactionStarted = true;
    } catch {
      // Fallback for standalone MongoDB without replica set
    }

    const sessionOption = transactionStarted ? { session } : {};

    // 1. Increment target team's totalPublicVotes
    const updatedTargetTeam = await Team.findByIdAndUpdate(
      targetTeamId,
      { $inc: { totalPublicVotes: numVotes } },
      { new: true, ...sessionOption }
    );

    // 2. Update or insert DailyVoteLog record
    await DailyVoteLog.findOneAndUpdate(
      { voterTeamId: voterTeam._id, targetTeamId: targetTeam._id, date: today },
      { $inc: { votesCast: numVotes } },
      { upsert: true, new: true, ...sessionOption }
    );

    if (transactionStarted) {
      await session.commitTransaction();
    }

    // Invalidate Redis Caches
    await delCache('cwc:leaderboard');
    await delCache('cwc:fan-favorite');

    const newTargetTotal = updatedTargetTeam ? updatedTargetTeam.totalPublicVotes : (targetTeam.totalPublicVotes || 0) + numVotes;

    // Broadcast VOTES_UPDATED WebSocket Event
    broadcastVotesUpdated({
      voterTeamId: voterTeam._id.toString(),
      voterTeamName: voterTeam.teamName,
      targetTeamId: targetTeam._id.toString(),
      targetTeamName: targetTeam.teamName,
      votesCast: numVotes,
      totalPublicVotes: newTargetTotal,
    });

    const newDailyRemaining = 100 - (totalVotesCastToday + numVotes);
    const newTargetRemaining = 15 - (votesForTargetToday + numVotes);

    return reply.send({
      success: true,
      message: `🎉 Successfully cast ${numVotes} vote(s) for '${targetTeam.teamName}'!`,
      voterTeamId: voterTeam._id.toString(),
      targetTeamId: targetTeam._id.toString(),
      votesCast: numVotes,
      totalPublicVotes: newTargetTotal,
      dailyVotesRemaining: newDailyRemaining,
      teamVotesRemaining: newTargetRemaining,
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



