const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự').max(100, 'Mật khẩu quá dài'),
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự').max(50, 'Tên hiển thị quá dài')
});

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
});

const verifyEmailSchema = z.object({
  token: z.string().min(10, 'Mã xác thực không hợp lệ')
});

const resendVerificationSchema = z.object({
  email: z.string().email('Email không hợp lệ').optional()
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Mã khôi phục không hợp lệ'),
  newPassword: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự').max(100, 'Mật khẩu quá dài')
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
