const prisma = require('../../lib/prisma');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Ngưỡng kinh nghiệm cho các cấp độ
 * Level 1 (Sơ Học): 0 XP
 * Level 2 (Tầm Đạo): 100 XP
 * Level 3 (Chiêm Nghiệm): 300 XP
 * Level 4 (Minh Triết): 700 XP
 * Level 5 (Hiền Giả): 1500 XP
 */
const XP_LEVEL_THRESHOLDS = [
  { level: 1, name: 'Sơ Học', minXp: 0 },
  { level: 2, name: 'Tầm Đạo', minXp: 100 },
  { level: 3, name: 'Chiêm Nghiệm', minXp: 300 },
  { level: 4, name: 'Minh Triết', minXp: 700 },
  { level: 5, name: 'Hiền Giả', minXp: 1500 }
];

/**
 * Tính toán cấp độ dựa trên điểm kinh nghiệm
 * @param {number} xp 
 * @returns {number}
 */
const calculateLevel = (xp) => {
  let level = 1;
  for (const threshold of XP_LEVEL_THRESHOLDS) {
    if (xp >= threshold.minXp) {
      level = threshold.level;
    } else {
      break;
    }
  }
  return level;
};

/**
 * Thưởng kinh nghiệm cho người dùng
 */
const awardXp = async (userId, { type, amount, refKey }) => {
  try {
    // Thêm lịch sử nhận XP (bỏ qua nếu trùng refKey)
    await prisma.xpEvent.create({
      data: {
        userId,
        type,
        amount,
        refKey
      }
    });

    // Cập nhật XP cho người dùng
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: amount }
      }
    });

    const newLevel = calculateLevel(user.xp);
    
    // Nâng cấp level nếu vượt ngưỡng
    if (newLevel > user.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel }
      });
      return { userXp: user.xp, level: newLevel, awarded: true };
    }

    return { userXp: user.xp, level: user.level, awarded: true };

  } catch (error) {
    if (error.code === 'P2002') {
      // Lỗi trùng lặp refKey (Unique constraint P2002) - Bỏ qua, không thưởng trùng
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return { userXp: user?.xp || 0, level: user?.level || 1, awarded: false };
    }
    throw error;
  }
};

/**
 * Lấy danh sách huy hiệu của người dùng
 */
const getUserBadges = async (userId) => {
  const badges = await prisma.badge.findMany();
  const userBadges = await prisma.userBadge.findMany({
    where: { userId }
  });

  const earnedBadgeIds = userBadges.map(ub => ub.badgeId);

  return badges.map(badge => {
    const earned = earnedBadgeIds.includes(badge.id);
    const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
    return {
      ...badge,
      earned,
      earnedAt: earned ? userBadge.createdAt : null
    };
  });
};

/**
 * Kiểm tra và trao huy hiệu cho người dùng
 */
const checkAndAwardBadges = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userBadges: true,
      readingSessions: true,
      highlights: true,
      aiQuestions: true,
      stats: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const badges = await prisma.badge.findMany();
  const earnedBadgeIds = user.userBadges.map(ub => ub.badgeId);
  const newBadges = [];

  for (const badge of badges) {
    if (earnedBadgeIds.includes(badge.id)) {
      continue; // Người dùng đã nhận huy hiệu này
    }

    let isEligible = false;

    switch (badge.code) {
      case 'first_read':
        if (user.readingSessions && user.readingSessions.length >= 1) {
          isEligible = true;
        }
        break;
      case 'streak_7':
        if (user.stats && (user.stats.currentStreak >= 7 || user.stats.longestStreak >= 7)) {
          isEligible = true;
        }
        break;
      case 'streak_30':
        if (user.stats && (user.stats.currentStreak >= 30 || user.stats.longestStreak >= 30)) {
          isEligible = true;
        }
        break;
      case 'quote_lover':
        if (user.highlights && user.highlights.length >= 5) {
          isEligible = true;
        }
        break;
      case 'philosopher_mind':
        if (user.aiQuestions && user.aiQuestions.length >= 10) {
          isEligible = true;
        }
        break;
      case 'level_3':
        if (user.level >= 3) {
          isEligible = true;
        }
        break;
    }

    if (isEligible) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id
        }
      });
      newBadges.push(badge);
    }
  }

  return { newBadges };
};

/**
 * Lấy bảng xếp hạng người dùng (Limit 10 mặc định)
 */
const getLeaderboard = async ({ limit = 10 }) => {
  // Bỏ qua user đã bị xóa hoặc cấm tùy thuộc vào schema. Giả định status có active.
  const topUsers = await prisma.user.findMany({
    where: {
      deletedAt: null // Exclude deleted users (assuming logical delete exists)
    },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      level: true,
      xp: true,
      stats: {
        select: {
          currentStreak: true
        }
      }
    },
    orderBy: [
      { xp: 'desc' },
      { stats: { currentStreak: 'desc' } }
    ],
    take: limit
  });

  return topUsers.map(user => ({
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    level: user.level,
    xp: user.xp,
    currentStreak: user.stats?.currentStreak || 0
  }));
};

/**
 * Khởi tạo dữ liệu huy hiệu mặc định
 */
const seedDefaultBadges = async () => {
  const count = await prisma.badge.count();
  if (count === 0) {
    const defaultBadges = [
      { code: 'first_read', name: 'First Read', description: 'Hoàn thành phiên đọc đầu tiên' },
      { code: 'streak_7', name: '7-Day Streak', description: 'Đạt chuỗi đọc 7 ngày' },
      { code: 'streak_30', name: '30-Day Streak', description: 'Đạt chuỗi đọc 30 ngày' },
      { code: 'quote_lover', name: 'Quote Lover', description: 'Tạo 5 highlight' },
      { code: 'philosopher_mind', name: 'Philosopher Mind', description: 'Hỏi AI 10 câu hỏi' },
      { code: 'level_3', name: 'Chiêm Nghiệm', description: 'Đạt cấp độ 3' },
    ];
    await prisma.badge.createMany({
      data: defaultBadges
    });
  }
};

module.exports = {
  XP_LEVEL_THRESHOLDS,
  calculateLevel,
  awardXp,
  getUserBadges,
  checkAndAwardBadges,
  getLeaderboard,
  seedDefaultBadges
};
