/**
 * Middleware factory kiểm tra quyền hạn.
 * Nếu user có bất kỳ quyền nào trong danh sách (hoặc là super_admin), sẽ được đi tiếp.
 * @param {...string} keys Danh sách các mã quyền (permission key)
 */
function requirePermission(...keys) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Yêu cầu đăng nhập' }
      });
    }

    // Super admin bỏ qua mọi kiểm tra quyền
    if (req.user.isSuperAdmin) {
      return next();
    }

    const hasPermission = keys.some(key => req.user.permissions?.includes(key));
    if (!hasPermission) {
      return res.status(403).json({
        error: { 
          code: 'FORBIDDEN', 
          message: 'Bạn không có quyền thực hiện hành động này' 
        }
      });
    }

    next();
  };
}

module.exports = requirePermission;
module.exports.requirePermission = requirePermission;
