const { z } = require('zod');

// Tải biến môi trường từ .env nếu đang ở môi trường dev
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (error) {
    // dotenv không được cài đặt, bỏ qua
  }
}

// Định nghĩa schema để kiểm tra biến môi trường
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  SESSION_SECRET: z.string().min(16).default('sophia-codex-development-secret-key-64-characters-long-key-for-dev'),
  DATABASE_URL: z.string().url().optional(), // Làm optional trong dev, validate sau
  CRON_SECRET: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STORAGE_BUCKET: z.string().default('media'),
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  VNPAY_TMN_CODE: z.string().optional(),
  VNPAY_HASH_SECRET: z.string().optional(),
  VNPAY_URL: z.string().url().optional(),
  VNPAY_API_URL: z.string().url().optional(),
  MOMO_PARTNER_CODE: z.string().optional(),
  MOMO_ACCESS_KEY: z.string().optional(),
  MOMO_SECRET_KEY: z.string().optional(),
  MOMO_ENDPOINT: z.string().url().optional(),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
});

// Xử lý logic cảnh báo hoặc lỗi
let parsedEnv;
try {
  parsedEnv = envSchema.parse(process.env);
  
  if (!parsedEnv.DATABASE_URL) {
    console.warn('⚠️ WARNING: DATABASE_URL is missing. Sophia Codex will run in SQLite standalone mode.');
  }
} catch (error) {
  console.error('❌ Lỗi xác thực biến môi trường:');
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  } else {
    console.error(error.message);
  }
  process.exit(1);
}

module.exports = { config: parsedEnv };
