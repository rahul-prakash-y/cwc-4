import { FastifyRequest, FastifyReply } from 'fastify';
import { Team } from '../models/Team.js';
import { Score } from '../models/Score.js';
import { Announcement } from '../models/Announcement.js';
import { getCache, setCache } from '../utils/redis.js';

/**
 * Public Leaderboard Endpoint with Redis Caching (30-second TTL)
 */
export async function getPublicLeaderboard(_request: FastifyRequest, reply: FastifyReply) {
  const cacheKey = 'cwc:leaderboard';

  const cachedData = await getCache<any>(cacheKey);
  if (cachedData) {
    return reply.header('X-Cache', 'HIT').send(cachedData);
  }

  // Aggregate leaderboard score data from MongoDB using indexed queries
  const teams = await Team.find({ status: { $in: ['Approved', 'Pending', 'Eliminated'] } })
    .select('teamName logoUrl themeColor status leader members advantages immunity')
    .lean();

  const leaderboard = await Promise.all(
    teams.map(async (team) => {
      const scores = await Score.find({ team: team._id }).select('pointsEarned');
      const totalPoints = scores.reduce((sum, s) => sum + (s.pointsEarned || 0), 0);
      return {
        id: team._id,
        teamName: team.teamName,
        logoUrl: team.logoUrl,
        themeColor: team.themeColor,
        status: team.status,
        immunity: team.immunity || false,
        advantagesCount: team.advantages ? team.advantages.reduce((sum, a) => sum + (a.quantity || 1), 0) : 0,
        totalPoints,
      };
    })
  );

  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  const rankedLeaderboard = leaderboard.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));

  const responsePayload = {
    updatedAt: new Date().toISOString(),
    count: rankedLeaderboard.length,
    leaderboard: rankedLeaderboard,
  };

  // Cache response for 30 seconds
  await setCache(cacheKey, responsePayload, 30);

  return reply.header('X-Cache', 'MISS').send(responsePayload);
}

/**
 * Public Announcements Endpoint with Redis Caching (30-second TTL)
 */
export async function getPublicAnnouncements(_request: FastifyRequest, reply: FastifyReply) {
  const cacheKey = 'cwc:announcements';

  const cachedData = await getCache<any>(cacheKey);
  if (cachedData) {
    return reply.header('X-Cache', 'HIT').send(cachedData);
  }

  const announcements = await Announcement.find()
    .sort({ pinned: -1, timestamp: -1, createdAt: -1 })
    .lean();

  const responsePayload = {
    updatedAt: new Date().toISOString(),
    count: announcements.length,
    announcements,
  };

  // Cache response for 30 seconds
  await setCache(cacheKey, responsePayload, 30);

  return reply.header('X-Cache', 'MISS').send(responsePayload);
}
