import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { generateToken } from '../middleware/auth.js';
import { sendEmail, sendCarnivalEmail } from '../utils/mailer.js';
import { getRegistrationEmailHtml } from '../utils/emailTemplates.js';

interface RegisterTeamBody {
  teamName: string;
  themeColor?: string;
  logoUrl?: string;
  residenceType?: 'Hosteller' | 'Day Scholar';
  leader: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
  };
  members?: Array<{
    name: string;
    email: string;
    role?: string;
  }>;
}

interface LoginBody {
  email: string;
  password: string;
}

interface ChangePasswordBody {
  oldPassword: string;
  newPassword: string;
}

interface RegisterAdminBody {
  name: string;
  email: string;
  password: string;
  adminSecret?: string;
}

/**
 * Task 1: Register Team ("Carnival Ticket" Application)
 * Creates the leader user account with standard default password and sets Team status to 'Pending'
 */
export async function registerTeam(request: FastifyRequest<{ Body: RegisterTeamBody }>, reply: FastifyReply) {
  const { teamName, themeColor, logoUrl, residenceType, leader, members = [] } = request.body;

  // Validation
  if (!teamName || !leader || !leader.name || !leader.email) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Missing required team or leader information',
    });
  }

  const normalizedEmail = leader.email.toLowerCase().trim();
  const normalizedTeamName = teamName.trim();

  // Check existing user or team
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return reply.status(400).send({
      error: 'Conflict',
      message: 'A user with this email address already exists.',
    });
  }

  const existingTeam = await Team.findOne({ teamName: normalizedTeamName });
  if (existingTeam) {
    return reply.status(400).send({
      error: 'Conflict',
      message: 'A team with this carnival team name already exists.',
    });
  }

  // Set standard default password if not provided
  const rawPassword = leader.password || 'CWC4-Student-2026';
  // Hash default password with bcrypt
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  // Create Leader User account with isFirstLogin: true
  const newUser = await User.create({
    name: leader.name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'student',
    isFirstLogin: true,
  });

  // Create Team Application with status 'Pending' (Carnival Ticket)
  const newTeam = await Team.create({
    teamName: normalizedTeamName,
    themeColor: themeColor || '#FF0055',
    logoUrl: logoUrl || '',
    residenceType: residenceType || 'Hosteller',
    status: 'Pending',
    leader: {
      name: leader.name.trim(),
      email: normalizedEmail,
      phone: leader.phone ? leader.phone.trim() : '',
      userId: newUser._id,
    },
    members: members.map((m) => ({
      name: m.name.trim(),
      email: m.email.toLowerCase().trim(),
      role: m.role || 'Member',
    })),
    advantages: [],
    immunity: false,
  });

  // Generate JWT token including isFirstLogin boolean flag
  const token = generateToken({
    userId: newUser._id.toString(),
    email: newUser.email,
    role: newUser.role,
    isFirstLogin: newUser.isFirstLogin,
    teamId: newTeam._id.toString(),
  });

  // Asynchronously dispatch Team Registration Confirmation & Passcodes Email
  setImmediate(() => {
    const html = getRegistrationEmailHtml({
      teamName: newTeam.teamName,
      leaderName: leader.name,
      leaderEmail: normalizedEmail,
      passcode: `CWC4-${newTeam._id.toString().substring(18).toUpperCase()}`,
    });

    sendCarnivalEmail(
      normalizedEmail,
      `🎪 Registration Confirmation & Passcode - Team ${newTeam.teamName}`,
      html
    );
  });

  return reply.status(201).send({
    message: '🎪 Carnival Ticket application submitted successfully! Team status: Pending Approval.',
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isFirstLogin: newUser.isFirstLogin ?? true,
    },
    team: {
      id: newTeam._id,
      teamName: newTeam.teamName,
      status: newTeam.status,
      themeColor: newTeam.themeColor,
      leader: newTeam.leader,
      members: newTeam.members,
    },
  });
}

/**
 * Task 1: User / Team Login
 * Authenticates email & password, returns JWT token and user/team data including isFirstLogin flag
 */
export async function login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
  const { email, password } = request.body;

  if (!email || !password) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Email and password are required',
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid email or password',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid email or password',
    });
  }

  if (user.isBlocked) {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Account has been blocked by SuperAdmin. Access revoked.',
    });
  }

  // Find associated team if student
  let team = null;
  if (user.role === 'student') {
    team = await Team.findOne({
      $or: [
        { 'leader.userId': user._id },
        { 'leader.email': normalizedEmail },
        { 'members.email': normalizedEmail },
      ],
    });

    if (team?.isBlocked) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Your team account has been blocked by SuperAdmin. Access revoked.',
      });
    }
  }

  const isFirstLoginFlag = user.isFirstLogin ?? true;

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    isFirstLogin: isFirstLoginFlag,
    teamId: team ? team._id.toString() : undefined,
  });

  return reply.send({
    message: 'Login successful! Welcome to CWC Season 4 Carnival 🎪',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isFirstLogin: isFirstLoginFlag,
    },
    team: team
      ? {
          id: team._id,
          teamName: team.teamName,
          status: team.status,
          themeColor: team.themeColor,
          logoUrl: team.logoUrl,
          advantages: team.advantages,
          immunity: team.immunity,
        }
      : null,
  });
}

/**
 * Task 2: Backend Change Password Route handler
 * Accepts { oldPassword, newPassword }, verifies oldPassword with bcrypt, hashes newPassword,
 * sets isFirstLogin: false, and returns updated user and fresh JWT.
 */
export async function changePassword(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  const { oldPassword, newPassword } = (request.body || {}) as ChangePasswordBody;

  if (!oldPassword || !newPassword) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Both old password and new password are required.',
    });
  }

  const user = await User.findById(request.user.userId);
  if (!user) {
    return reply.status(404).send({
      error: 'Not Found',
      message: 'User not found.',
    });
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isOldPasswordValid) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Incorrect current password.',
    });
  }

  if (newPassword.length < 6) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'New password must be at least 6 characters long.',
    });
  }

  // Hash new password and set isFirstLogin to false
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = newPasswordHash;
  user.isFirstLogin = false;
  await user.save();

  let teamId = request.user.teamId;
  if (user.role === 'student' && !teamId) {
    const team = await Team.findOne({
      $or: [
        { 'leader.userId': user._id },
        { 'leader.email': user.email },
        { 'members.email': user.email },
      ],
    });
    if (team) teamId = team._id.toString();
  }

  const newToken = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    isFirstLogin: false,
    teamId,
  });

  return reply.send({
    message: '🔑 Password updated successfully! Your arena account security setup is complete.',
    token: newToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isFirstLogin: false,
    },
  });
}

/**
 * Seed / Register Admin route
 */
export async function registerAdmin(request: FastifyRequest<{ Body: RegisterAdminBody }>, reply: FastifyReply) {
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Name, email, and password are required for admin creation',
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return reply.status(400).send({
      error: 'Conflict',
      message: 'User already exists',
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const adminUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'admin',
    isFirstLogin: false,
  });

  const token = generateToken({
    userId: adminUser._id.toString(),
    email: adminUser.email,
    role: adminUser.role,
    isFirstLogin: false,
  });

  return reply.status(201).send({
    message: 'Admin account created successfully 🎩',
    token,
    user: {
      id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      isFirstLogin: false,
    },
  });
}

/**
 * Get current authenticated user profile
 */
export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
  }

  const user = await User.findById(request.user.userId);
  if (!user) {
    return reply.status(404).send({ error: 'Not Found', message: 'User not found' });
  }

  let team = null;
  if (user.role === 'student') {
    team = await Team.findOne({
      $or: [
        { 'leader.userId': user._id },
        { 'leader.email': user.email },
        { 'members.email': user.email },
      ],
    });
  }

  return reply.send({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isFirstLogin: user.isFirstLogin ?? true,
    },
    team,
  });
}

