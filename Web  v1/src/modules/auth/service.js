const prisma = require('../../lib/prisma');
const { hashPassword, verifyPassword } = require('../../lib/password');
const cryptoUtils = require('../../lib/crypto');
const mailer = require('../../lib/mailer');
const AppError = require('../../middleware/errorHandler').AppError;

/**
 * Đăng ký tài khoản mới
 */
const register = async ({ email, password, displayName }) => {
  const normalizedEmail = email.toLowerCase();
  
  // Kiểm tra email tồn tại
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    // Để bảo mật, không ném lỗi khác biệt, nhưng không tạo mới
    // Ở đây ta cứ trả về success như đã làm hoặc ném lỗi chung chung
    // Nhưng yêu cầu "do NOT throw an error that reveals account existence" - ta trả về success
    return { success: true, message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.' };
  }

  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: hashedPassword,
      displayName,
      status: 'PENDING',
      roles: {
        create: {
          role: {
            connect: { name: 'member' }
          }
        }
      }
    }
  });

  const rawToken = cryptoUtils.generateToken(32);
  const tokenHash = cryptoUtils.hashString(rawToken);

  await prisma.emailToken.create({
    data: {
      userId: user.id,
      tokenHash,
      type: 'VERIFY',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
  });

  await mailer.sendVerificationEmail(normalizedEmail, rawToken, displayName);

  return { success: true, message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.' };
};

/**
 * Xác thực email
 */
const verifyEmail = async (token) => {
  const tokenHash = cryptoUtils.hashString(token);

  const emailToken = await prisma.emailToken.findFirst({
    where: {
      tokenHash,
      type: 'VERIFY',
      usedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  if (!emailToken) {
    throw new AppError(400, 'INVALID_TOKEN', 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
  }

  await prisma.$transaction([
    prisma.emailToken.update({
      where: { id: emailToken.id },
      data: { usedAt: new Date() }
    }),
    prisma.user.update({
      where: { id: emailToken.userId },
      data: {
        status: 'ACTIVE',
        emailVerifiedAt: new Date()
      }
    })
  ]);

  return { success: true, message: 'Xác thực email thành công.' };
};

/**
 * Gửi lại email xác thực
 */
const resendVerification = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) throw new AppError(404, 'NOT_FOUND', 'Người dùng không tồn tại.');
  if (user.status === 'ACTIVE') throw new AppError(400, 'ALREADY_ACTIVE', 'Tài khoản đã được xác thực.');

  const rawToken = cryptoUtils.generateToken(32);
  const tokenHash = cryptoUtils.hashString(rawToken);

  await prisma.emailToken.create({
    data: {
      userId: user.id,
      tokenHash,
      type: 'VERIFY',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });

  await mailer.sendVerificationEmail(user.email, rawToken, user.displayName);

  return { success: true, message: 'Email xác thực mới đã được gửi.' };
};

/**
 * Đăng nhập
 */
const login = async ({ email, password, ip, userAgent }) => {
  const normalizedEmail = email.toLowerCase();
  
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không chính xác');
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError(423, 'ACCOUNT_LOCKED', 'Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần');
  }

  const isValidPassword = await verifyPassword(user.passwordHash, password);

  if (!isValidPassword) {
    const failedCount = user.failedLoginCount + 1;
    const updates = { failedLoginCount: failedCount };
    
    if (failedCount >= 5) {
      updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: updates
    });
    
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không chính xác');
  }

  // Success login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date()
    }
  });

  const sessionToken = cryptoUtils.generateToken(32);
  const sessionTokenHash = cryptoUtils.hashString(sessionToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: sessionTokenHash,
      ip,
      userAgent,
      expiresAt
    }
  });

  return { user, sessionToken, expiresAt };
};

/**
 * Đăng xuất
 */
const logout = async (sessionToken) => {
  if (sessionToken) {
    const tokenHash = cryptoUtils.hashString(sessionToken);
    await prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
};

/**
 * Đăng xuất tất cả các phiên
 */
const logoutAll = async (userId) => {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
};

/**
 * Quên mật khẩu
 */
const forgotPassword = async (email) => {
  const normalizedEmail = email.toLowerCase();
  
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (user) {
    const rawToken = cryptoUtils.generateToken(32);
    const tokenHash = cryptoUtils.hashString(rawToken);

    await prisma.emailToken.create({
      data: {
        userId: user.id,
        tokenHash,
        type: 'RESET',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 mins
      }
    });

    await mailer.sendPasswordResetEmail(user.email, rawToken);
  }

  // Luôn trả về thông báo chung chung
  return { success: true, message: 'Nếu email tồn tại trong hệ thống, hướng dẫn khôi phục đã được gửi.' };
};

/**
 * Đặt lại mật khẩu
 */
const resetPassword = async (token, newPassword) => {
  const tokenHash = cryptoUtils.hashString(token);

  const emailToken = await prisma.emailToken.findFirst({
    where: {
      tokenHash,
      type: 'RESET',
      usedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });

  if (!emailToken) {
    throw new AppError(400, 'INVALID_TOKEN', 'Mã khôi phục không hợp lệ hoặc đã hết hạn.');
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: emailToken.userId },
      data: { passwordHash: hashedPassword }
    }),
    prisma.session.updateMany({
      where: { userId: emailToken.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    }),
    prisma.emailToken.update({
      where: { id: emailToken.id },
      data: { usedAt: new Date() }
    })
  ]);

  await mailer.sendPasswordChangedAlert(emailToken.user.email);

  return { success: true, message: 'Đặt lại mật khẩu thành công.' };
};

/**
 * Lấy thông tin tài khoản hiện tại
 */
const getMe = async (user) => {
  if (!user) {
    return { user: null, isLoggedIn: false };
  }

  const userDetails = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      roles: { include: { role: true } },
      subscription: {
        where: { expiresAt: { gt: new Date() } },
        include: { plan: true }
      }
    }
  });

  const roles = userDetails.roles.map(ur => ur.role.name);
  const activeSubscription = userDetails.subscription[0] || null;

  return {
    isLoggedIn: true,
    user: {
      id: userDetails.id,
      email: userDetails.email,
      displayName: userDetails.displayName,
      avatarUrl: userDetails.avatarUrl,
      status: userDetails.status,
      roles,
      subscription: activeSubscription,
      // Tính toán daily AI quota dựa trên gói ở đây (giả sử)
      dailyAiQuota: activeSubscription ? activeSubscription.plan.aiQuota : 10 
    }
  };
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  getMe
};
