import { FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import { Team } from '../models/Team.js';
import { Task } from '../models/Task.js';
import { Score } from '../models/Score.js';
import { Submission, SubmissionFileType } from '../models/Submission.js';
import { User } from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { delCache } from '../utils/redis.js';

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
  const currentScore = teamScores.reduce((sum, item) => sum + (item.pointsEarned || 0), 0);

  // Calculate team rank across all approved teams
  const allTeams = await Team.find({ status: 'Approved' }).select('_id');
  const teamScoresList = await Promise.all(
    allTeams.map(async (t) => {
      const scores = await Score.find({ team: t._id });
      const total = scores.reduce((acc, curr) => acc + (curr.pointsEarned || 0), 0);
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
  githubUrl?: string;
  fileUrl?: string;
  fileType?: SubmissionFileType;
  notes?: string;
  advantageUsed?: string;
}

/**
 * Task 4: Submit a task (GitHub links, PDF/Image Cloudinary URLs) & deduct advantage
 */
export async function submitTask(
  request: FastifyRequest<{
    Params: { taskId: string };
    Body: SubmitTaskBody;
  }>,
  reply: FastifyReply
) {
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
