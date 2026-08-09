import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { AuditLog } from '../models/AuditLog.js';
import { Score } from '../models/Score.js';
import { Attendance } from '../models/Attendance.js';
import { Submission } from '../models/Submission.js';
import { Settings, getGlobalSettings } from '../models/Settings.js';
import { logAudit } from '../middleware/auth.js';
import { logAdminAction } from '../utils/auditLogger.js';
import { disconnectUserSockets, broadcastSettingsUpdated } from '../socket.js';
/**
 * Task 3: Fetch Paginated Audit Logs with Search & Date Filters
 */
export async function getAuditLogs(request, reply) {
    const page = parseInt(request.query.page || '1', 10);
    const limit = parseInt(request.query.limit || '20', 10);
    const skip = (page - 1) * limit;
    const filter = {};
    if (request.query.search) {
        const searchRegex = new RegExp(request.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [
            { ipAddress: searchRegex },
            { action: searchRegex },
            { actorRole: searchRegex },
            { resource: searchRegex },
            { userAgent: searchRegex },
            { adminEmail: searchRegex },
            { targetId: searchRegex },
            { targetType: searchRegex },
        ];
    }
    if (request.query.action && request.query.action !== 'ALL') {
        filter.action = request.query.action;
    }
    if (request.query.startDate || request.query.endDate) {
        filter.timestamp = {};
        if (request.query.startDate) {
            filter.timestamp.$gte = new Date(request.query.startDate);
        }
        if (request.query.endDate) {
            filter.timestamp.$lte = new Date(request.query.endDate);
        }
    }
    const [logs, total] = await Promise.all([
        AuditLog.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        AuditLog.countDocuments(filter),
    ]);
    return reply.send({
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
    });
}
/**
 * Task 3: Toggle the isBlocked status of a student or team
 */
export async function toggleBlockStatus(request, reply) {
    const targetId = request.params.id;
    const { targetType, isBlocked: explicitBlockedState } = request.body || {};
    let updatedTarget = null;
    let newBlockedState = false;
    let resolvedType = targetType;
    // Try finding in User first unless explicitly specified as 'team'
    if (targetType !== 'team') {
        const userDoc = await User.findById(targetId);
        if (userDoc) {
            resolvedType = 'user';
            newBlockedState =
                typeof explicitBlockedState === 'boolean'
                    ? explicitBlockedState
                    : !userDoc.isBlocked;
            userDoc.isBlocked = newBlockedState;
            userDoc.sessionVersion = (userDoc.sessionVersion || 0) + 1;
            await userDoc.save();
            updatedTarget = userDoc.toJSON();
            // If user is student, also sync team leader/member block status if desired
            if (userDoc.role === 'student') {
                const teamDoc = await Team.findOne({
                    $or: [
                        { 'leader.userId': userDoc._id },
                        { 'leader.email': userDoc.email },
                    ],
                });
                if (teamDoc) {
                    teamDoc.isBlocked = newBlockedState;
                    await teamDoc.save();
                }
            }
        }
    }
    // If not found in User or explicitly specified as 'team'
    if (!updatedTarget) {
        const teamDoc = await Team.findById(targetId);
        if (teamDoc) {
            resolvedType = 'team';
            newBlockedState =
                typeof explicitBlockedState === 'boolean'
                    ? explicitBlockedState
                    : !teamDoc.isBlocked;
            teamDoc.isBlocked = newBlockedState;
            await teamDoc.save();
            updatedTarget = teamDoc.toJSON();
            // Also block team leader's User account and bump sessionVersion
            if (teamDoc.leader?.userId) {
                await User.findByIdAndUpdate(teamDoc.leader.userId, {
                    isBlocked: newBlockedState,
                    $inc: { sessionVersion: 1 },
                });
            }
        }
    }
    if (!updatedTarget) {
        return reply.status(404).send({
            error: 'Not Found',
            message: 'Student user or team not found with provided ID.',
        });
    }
    // If target was blocked, force-disconnect active WebSocket sessions instantly
    if (newBlockedState) {
        disconnectUserSockets(targetId);
        if (updatedTarget.leader?.userId) {
            disconnectUserSockets(updatedTarget.leader.userId.toString());
        }
    }
    // Log action in AuditLog
    await logAdminAction(request, newBlockedState ? 'BLOCK_ACCOUNT' : 'UNBLOCK_ACCOUNT', targetId, {
        targetType: resolvedType,
        isBlocked: newBlockedState,
        targetName: updatedTarget.name || updatedTarget.teamName,
        email: updatedTarget.email || updatedTarget.leader?.email,
    });
    return reply.send({
        message: `${resolvedType === 'team' ? 'Team' : 'User'} account has been ${newBlockedState ? 'blocked 🚫' : 'unblocked ✅'} successfully.`,
        isBlocked: newBlockedState,
        target: updatedTarget,
    });
}
/**
 * Task 3: Force Reset Student Password to Default, set isFirstLogin: true, and increment sessionVersion
 */
export async function forceResetPassword(request, reply) {
    const userId = request.params.id;
    const user = await User.findById(userId);
    if (!user) {
        return reply.status(404).send({
            error: 'Not Found',
            message: 'User account not found.',
        });
    }
    const defaultPassword = 'CWC4-Student-2026';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    user.passwordHash = passwordHash;
    user.isFirstLogin = true;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();
    // Audit log entry
    await logAdminAction(request, 'FORCE_RESET_PASSWORD', user._id.toString(), {
        userEmail: user.email,
        userName: user.name,
        defaultPassword,
        isFirstLogin: true,
    });
    return reply.send({
        message: `🔑 Password for ${user.email} force-reset to default standard passcode successfully.`,
        defaultPassword,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isFirstLogin: true,
        },
    });
}
/**
 * Task 3: SuperAdmin Force Logout - Increments user's sessionVersion to instantly invalidate active JWT cookie
 */
export async function forceLogout(request, reply) {
    const targetId = request.params.id;
    let user = await User.findById(targetId);
    let resolvedType = 'user';
    if (user) {
        user.sessionVersion = (user.sessionVersion || 0) + 1;
        await user.save();
        disconnectUserSockets(user._id.toString());
    }
    else {
        const team = await Team.findById(targetId);
        if (team) {
            resolvedType = 'team';
            if (team.leader?.userId) {
                user = await User.findById(team.leader.userId);
                if (user) {
                    user.sessionVersion = (user.sessionVersion || 0) + 1;
                    await user.save();
                    disconnectUserSockets(user._id.toString());
                }
            }
            const memberUserIds = team.members.map((m) => m.userId).filter(Boolean);
            if (memberUserIds.length > 0) {
                await User.updateMany({ _id: { $in: memberUserIds } }, { $inc: { sessionVersion: 1 } });
                memberUserIds.forEach((mId) => disconnectUserSockets(mId.toString()));
            }
        }
    }
    if (!user) {
        return reply.status(404).send({
            error: 'Not Found',
            message: 'User or team account not found.',
        });
    }
    await logAdminAction(request, 'USER_FORCE_LOGGED_OUT', targetId, {
        targetType: resolvedType,
        name: user.name,
        email: user.email,
    });
    return reply.send({
        message: `⚡ Force logout successful! Active session for ${user.email} has been invalidated.`,
        userId: targetId,
    });
}
/**
 * Task 3: SuperAdmin Delete User or Team - Permanently deletes user/team and cleans up associated scores/attendance
 */
export async function deleteUser(request, reply) {
    const targetId = request.params.id;
    let user = await User.findById(targetId);
    let team = await Team.findById(targetId);
    if (!user && !team) {
        user = await User.findById(targetId);
        if (!user) {
            return reply.status(404).send({
                error: 'Not Found',
                message: 'Account not found with provided ID.',
            });
        }
    }
    let deletedDetails = {};
    if (user) {
        deletedDetails = {
            type: 'User',
            name: user.name,
            email: user.email,
            role: user.role,
        };
        disconnectUserSockets(user._id.toString());
        const userTeam = await Team.findOne({
            $or: [{ 'leader.userId': user._id }, { 'members.userId': user._id }],
        });
        if (userTeam) {
            if (userTeam.leader?.userId?.toString() === user._id.toString()) {
                await Team.findByIdAndDelete(userTeam._id);
                await Score.deleteMany({ teamId: userTeam._id });
                await Attendance.deleteMany({ teamId: userTeam._id });
                await Submission.deleteMany({ teamId: userTeam._id });
            }
            else {
                userTeam.members = userTeam.members.filter((m) => m.userId?.toString() !== user._id.toString());
                await userTeam.save();
            }
        }
        await Score.deleteMany({ userId: user._id });
        await Attendance.deleteMany({ userId: user._id });
        await Submission.deleteMany({ userId: user._id });
        await User.findByIdAndDelete(user._id);
    }
    else if (team) {
        deletedDetails = {
            type: 'Team',
            name: team.teamName,
            leaderEmail: team.leader?.email,
        };
        if (team.leader?.userId) {
            disconnectUserSockets(team.leader.userId.toString());
            await User.findByIdAndDelete(team.leader.userId);
        }
        const memberUserIds = team.members.map((m) => m.userId).filter(Boolean);
        memberUserIds.forEach((mId) => disconnectUserSockets(mId.toString()));
        if (memberUserIds.length > 0) {
            await User.deleteMany({ _id: { $in: memberUserIds } });
        }
        await Score.deleteMany({ teamId: team._id });
        await Attendance.deleteMany({ teamId: team._id });
        await Submission.deleteMany({ teamId: team._id });
        await Team.findByIdAndDelete(team._id);
    }
    await logAdminAction(request, 'USER_DELETED', targetId, deletedDetails);
    return reply.send({
        message: `🗑️ Account (${deletedDetails.name || targetId}) permanently deleted along with all associated scores, attendance, and team records.`,
    });
}
/**
 * Task 3: Manage Admins (Create, list, update role, or revoke access)
 */
export async function manageAdmins(request, reply) {
    const { actionType = 'create', name, email, password, role = 'admin', adminId } = request.body || {};
    if (request.method === 'GET') {
        const adminList = await User.find({
            role: { $in: ['admin', 'superadmin'] },
        }).select('-passwordHash');
        return reply.send({ admins: adminList });
    }
    if (actionType === 'revoke' || request.method === 'DELETE') {
        const targetId = adminId || request.params.id || request.body?.id;
        if (!targetId) {
            return reply.status(400).send({
                error: 'Bad Request',
                message: 'Admin ID is required for revoking access.',
            });
        }
        const adminUser = await User.findById(targetId);
        if (!adminUser) {
            return reply.status(404).send({
                error: 'Not Found',
                message: 'Admin account not found.',
            });
        }
        // Demote to student or delete admin account
        adminUser.role = 'student';
        await adminUser.save();
        await logAudit({
            adminId: request.user.userId,
            adminEmail: request.user.email,
            action: 'REVOKE_ADMIN',
            targetId: adminUser._id.toString(),
            targetType: 'User',
            details: { email: adminUser.email, demotedTo: 'student' },
            ipAddress: request.ip,
        });
        return reply.send({
            message: `Admin access revoked for ${adminUser.email}. Demoted to student role.`,
        });
    }
    // Create or Update Admin
    if (!email || !name) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'Name and email are required for admin management.',
        });
    }
    const normalizedEmail = email.toLowerCase().trim();
    let adminUser = await User.findOne({ email: normalizedEmail });
    if (!adminUser) {
        // Create new Admin
        const rawPassword = password || 'CWC4-Admin-2026';
        const passwordHash = await bcrypt.hash(rawPassword, 10);
        adminUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            role: role === 'superadmin' ? 'superadmin' : 'admin',
            isFirstLogin: false,
            isBlocked: false,
        });
        await logAudit({
            adminId: request.user.userId,
            adminEmail: request.user.email,
            action: 'CREATE_ADMIN',
            targetId: adminUser._id.toString(),
            targetType: 'User',
            details: { email: adminUser.email, role: adminUser.role },
            ipAddress: request.ip,
        });
        return reply.status(201).send({
            message: `🎩 ${adminUser.role.toUpperCase()} account created successfully for ${adminUser.email}`,
            admin: {
                id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
            },
        });
    }
    else {
        // Update existing user role to admin / superadmin
        adminUser.role = role === 'superadmin' ? 'superadmin' : 'admin';
        if (password) {
            adminUser.passwordHash = await bcrypt.hash(password, 10);
        }
        await adminUser.save();
        await logAudit({
            adminId: request.user.userId,
            adminEmail: request.user.email,
            action: 'UPDATE_ADMIN_ROLE',
            targetId: adminUser._id.toString(),
            targetType: 'User',
            details: { email: adminUser.email, role: adminUser.role },
            ipAddress: request.ip,
        });
        return reply.send({
            message: `Updated privileges for ${adminUser.email} to ${adminUser.role}.`,
            admin: {
                id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
            },
        });
    }
}
/**
 * Security Search helper endpoint for searching students and teams
 */
export async function getSecurityTargets(request, reply) {
    const query = request.query.search ? request.query.search.trim() : '';
    let userFilter = { role: 'student' };
    let teamFilter = {};
    if (query) {
        const reg = new RegExp(query, 'i');
        userFilter.$or = [{ name: reg }, { email: reg }];
        teamFilter.$or = [
            { teamName: reg },
            { 'leader.name': reg },
            { 'leader.email': reg },
        ];
    }
    const [students, teams] = await Promise.all([
        User.find(userFilter).select('-passwordHash').limit(20).lean(),
        Team.find(teamFilter).limit(20).lean(),
    ]);
    return reply.send({
        students,
        teams,
    });
}
/**
 * Task 3: Update Global Singleton Settings (CMS)
 */
export async function updateGlobalSettings(request, reply) {
    const updates = {};
    const body = request.body || {};
    if (body.eventStartDate !== undefined) {
        updates.eventStartDate = new Date(body.eventStartDate);
    }
    if (body.currentSeason !== undefined) {
        updates.currentSeason = Number(body.currentSeason);
    }
    if (body.isRegistrationOpen !== undefined) {
        updates.isRegistrationOpen = Boolean(body.isRegistrationOpen);
    }
    if (body.isLeaderboardVisible !== undefined) {
        updates.isLeaderboardVisible = Boolean(body.isLeaderboardVisible);
    }
    if (body.heroBannerText !== undefined) {
        updates.heroBannerText = String(body.heroBannerText);
    }
    if (body.isGrandFinale !== undefined) {
        updates.isGrandFinale = Boolean(body.isGrandFinale);
    }
    let settings = await Settings.findOneAndUpdate({}, { $set: updates }, { upsert: true, new: true }).lean();
    if (!settings) {
        settings = await getGlobalSettings();
    }
    // Broadcast WebSocket event
    broadcastSettingsUpdated(settings);
    // Log Audit Action
    await logAudit({
        adminId: request.user?.userId || 'superadmin',
        adminEmail: request.user?.email || 'superadmin@cwc.com',
        action: 'UPDATE_SETTINGS',
        targetId: settings._id?.toString() || 'singleton',
        targetType: 'Settings',
        details: updates,
        ipAddress: request.ip,
    });
    return reply.send({
        message: '⚙️ Global Site Configuration updated successfully!',
        settings,
    });
}
