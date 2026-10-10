const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? '/tmp' : path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'local_users.json');

// In-memory sessions store for local mode
// Map: sessionToken -> { userId, createdAt, expiresAt }
const sessions = new Map();

// Default seed users if file is missing
const DEFAULT_USERS = [
  {
    id: 'usr_seed_admin',
    email: 'admin@sophiacodex.vn',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$zsrWqLJuAOVO5cZsB+1kjA$wIPa0je87anFnbkvAs+uYxRWaTsU5xtIj0eHT21BC44', // Admin@Sophia2026!
    displayName: 'Quản Trị Viên',
    isSuperAdmin: true,
    permissions: ['*'],
    roles: ['admin'],
    level: 5,
    xp: 9999,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_demo_reader',
    email: 'docgia@sophiacodex.vn',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$O/A7KKAHZyRVFa1PPJc+dQ$7lDVfyQY1GN/WLFSgb2S2HdlyRLFAQW1Y/0ictC8imQ', // Docgia@Sophia2026!
    displayName: 'Độc Giả Triết Học',
    isSuperAdmin: false,
    permissions: ['reader.read'],
    roles: ['member'],
    level: 1,
    xp: 150,
    createdAt: new Date().toISOString()
  }
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {}
  }
}

function loadUsers() {
  try {
    ensureDataDir();
    if (!fs.existsSync(USERS_FILE)) {
      // Nếu trên môi trường Serverless, nạp từ file source nếu có
      const sourceUsers = path.join(__dirname, '../../data', 'local_users.json');
      if (fs.existsSync(sourceUsers)) {
        try {
          const raw = fs.readFileSync(sourceUsers, 'utf8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            saveUsers(parsed);
            return parsed;
          }
        } catch (e) {}
      }
      saveUsers(DEFAULT_USERS);
      return [...DEFAULT_USERS];
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveUsers(DEFAULT_USERS);
      return [...DEFAULT_USERS];
    }
    return parsed;
  } catch (err) {
    console.error('[localUserStore] Lỗi đọc local_users.json, khôi phục mặc định:', err.message);
    return [...DEFAULT_USERS];
  }
}

function saveUsers(users) {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[localUserStore] Lỗi ghi local_users.json:', err.message);
    return false;
  }
}

function findByEmail(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const users = loadUsers();
  return users.find(u => u.email.trim().toLowerCase() === normalized) || null;
}

function findById(id) {
  if (!id) return null;
  const users = loadUsers();
  return users.find(u => u.id === id) || null;
}

function createUser({ email, passwordHash, displayName }) {
  const normalized = email.trim().toLowerCase();
  const users = loadUsers();
  
  if (users.some(u => u.email.trim().toLowerCase() === normalized)) {
    throw new Error('EMAIL_EXISTS');
  }

  const isAdmin = normalized === 'admin@sophiacodex.vn';
  const newUser = {
    id: 'usr_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
    email: normalized,
    passwordHash,
    displayName: displayName || normalized.split('@')[0],
    isSuperAdmin: isAdmin,
    permissions: isAdmin ? ['*'] : ['reader.read'],
    roles: isAdmin ? ['admin'] : ['member'],
    level: isAdmin ? 5 : 1,
    xp: isAdmin ? 9999 : 100,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

// Session management
function createSession(userId) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày
  sessions.set(sessionToken, {
    userId,
    createdAt: Date.now(),
    expiresAt
  });
  return { sessionToken, expiresAt };
}

function getSession(sessionToken) {
  if (!sessionToken) return null;
  const session = sessions.get(sessionToken);
  if (!session) return null;

  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    sessions.delete(sessionToken);
    return null;
  }

  const user = findById(session.userId);
  if (!user) {
    sessions.delete(sessionToken);
    return null;
  }

  return { session, user };
}

function deleteSession(sessionToken) {
  if (sessionToken) {
    sessions.delete(sessionToken);
  }
}

function deleteSessionsByUserId(userId) {
  for (const [token, session] of sessions.entries()) {
    if (session.userId === userId) {
      sessions.delete(token);
    }
  }
}

module.exports = {
  loadUsers,
  saveUsers,
  findByEmail,
  findById,
  createUser,
  createSession,
  getSession,
  deleteSession,
  deleteSessionsByUserId
};
