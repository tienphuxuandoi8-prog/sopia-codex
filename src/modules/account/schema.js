const { z } = require('zod');

const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự').max(50, 'Tên hiển thị quá dài').optional(),
  bio: z.string().max(300, 'Giới thiệu quá dài').optional(),
  avatarUrl: z.union([z.string().url('Avatar URL không hợp lệ'), z.string().max(0)]).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự').max(100, 'Mật khẩu quá dài')
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema
};
