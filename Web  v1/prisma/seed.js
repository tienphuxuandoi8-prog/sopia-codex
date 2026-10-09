/**
 * SOPHIA CODEX - PRISMA DATABASE SEEDER
 * Khởi tạo dữ liệu cốt lõi: Permissions, Roles, Plans, System Settings, Super Admin.
 * Chạy lệnh: npx prisma db seed hoặc npm run db:seed
 */

const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/lib/password');

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Nhóm Dashboard
  { key: 'dashboard.view', group: 'dashboard', description: 'Xem bảng điều khiển tổng quan' },

  // Nhóm Quản lý sách
  { key: 'book.view_all', group: 'books', description: 'Xem mọi tác phẩm (kể cả bản nháp)' },
  { key: 'book.create', group: 'books', description: 'Tạo tác phẩm mới' },
  { key: 'book.update', group: 'books', description: 'Chỉnh sửa tác phẩm' },
  { key: 'book.delete', group: 'books', description: 'Xóa tác phẩm' },
  { key: 'book.publish', group: 'books', description: 'Xuất bản tác phẩm' },

  // Nhóm Quản lý chương
  { key: 'chapter.create', group: 'chapters', description: 'Thêm chương mới' },
  { key: 'chapter.update', group: 'chapters', description: 'Chỉnh sửa nội dung chương' },
  { key: 'chapter.delete', group: 'chapters', description: 'Xóa chương' },
  { key: 'chapter.publish', group: 'chapters', description: 'Xuất bản chương' },

  // Nhóm Nội dung phụ trợ
  { key: 'quote.manage', group: 'content', description: 'Quản lý danh ngôn triết học' },
  { key: 'philosopher.manage', group: 'content', description: 'Quản lý thông tin triết gia' },
  { key: 'category.manage', group: 'content', description: 'Quản lý chuyên mục' },
  { key: 'media.upload', group: 'content', description: 'Tải lên hình ảnh / tài nguyên' },

  // Nhóm Cộng đồng & Kiểm duyệt
  { key: 'comment.moderate', group: 'community', description: 'Duyệt, ẩn hoặc xóa bình luận' },
  { key: 'review.moderate', group: 'community', description: 'Quản lý đánh giá và xếp hạng' },
  { key: 'banned_word.manage', group: 'community', description: 'Quản lý danh sách từ cấm' },

  // Nhóm Quản trị người dùng
  { key: 'user.view', group: 'users', description: 'Xem danh sách và chi tiết người dùng' },
  { key: 'user.update', group: 'users', description: 'Chỉnh sửa thông tin người dùng' },
  { key: 'user.ban', group: 'users', description: 'Khóa / cấm tài khoản người dùng' },
  { key: 'user.delete', group: 'users', description: 'Xóa tài khoản người dùng' },
  { key: 'user.assign_role', group: 'users', description: 'Phân vai trò cho người dùng' },

  // Nhóm Quản trị vai trò & quyền
  { key: 'role.view', group: 'roles', description: 'Xem vai trò và bảng phân quyền' },
  { key: 'role.manage', group: 'roles', description: 'Tạo, sửa, xóa vai trò và gán quyền' },

  // Nhóm Kinh doanh & Thanh toán
  { key: 'plan.manage', group: 'commerce', description: 'Quản lý gói dịch vụ Premium' },
  { key: 'order.view', group: 'commerce', description: 'Xem danh sách và trạng thái đơn hàng' },
  { key: 'subscription.grant', group: 'commerce', description: 'Cấp hoặc gia hạn gói Premium thủ công' },
  { key: 'payment.reconcile', group: 'commerce', description: 'Đối soát và kiểm tra cổng thanh toán' },

  // Nhóm AI Socrates
  { key: 'ai.view_logs', group: 'ai', description: 'Xem nhật ký đối thoại AI của người dùng' },
  { key: 'ai.settings', group: 'ai', description: 'Cấu hình hạn mức và mô hình AI' },

  // Nhóm Hệ thống
  { key: 'settings.manage', group: 'system', description: 'Cấu hình tham số hệ thống' },
  { key: 'audit.view', group: 'system', description: 'Xem nhật ký hành động (Audit Log)' },
  { key: 'system.backup', group: 'system', description: 'Sao lưu và bảo trì dữ liệu' },
];

async function main() {
  console.log('🚀 Bắt đầu Seeding cơ sở dữ liệu Sophia Codex...');

  // 1. Seed Permissions
  console.log('📦 1. Đồng bộ Permissions...');
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: { group: p.group, description: p.description },
      create: p,
    });
  }
  console.log(`   ✓ Đã hoàn tất ${PERMISSIONS.length} permissions.`);

  // 2. Seed Roles
  console.log('👑 2. Khởi tạo Vai trò (Roles)...');
  const superAdminRole = await prisma.role.upsert({
    where: { key: 'super_admin' },
    update: { name: 'Super Admin', isSystem: true },
    create: {
      key: 'super_admin',
      name: 'Super Administrator',
      description: 'Toàn quyền tối cao trong hệ thống',
      isSystem: true,
    },
  });

  const memberRole = await prisma.role.upsert({
    where: { key: 'member' },
    update: { name: 'Thành viên', isSystem: true },
    create: {
      key: 'member',
      name: 'Thành viên',
      description: 'Độc giả đã đăng ký tài khoản',
      isSystem: true,
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { key: 'editor' },
    update: { name: 'Biên tập viên' },
    create: {
      key: 'editor',
      name: 'Biên tập viên',
      description: 'Quản lý tác phẩm, chương sách, triết gia và danh ngôn',
      isSystem: false,
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { key: 'moderator' },
    update: { name: 'Kiểm duyệt viên' },
    create: {
      key: 'moderator',
      name: 'Kiểm duyệt viên',
      description: 'Kiểm duyệt bình luận, đánh giá cộng đồng',
      isSystem: false,
    },
  });

  // Gán quyền cho Editor
  const editorPermKeys = [
    'dashboard.view', 'book.view_all', 'book.create', 'book.update', 'book.publish',
    'chapter.create', 'chapter.update', 'chapter.publish',
    'quote.manage', 'philosopher.manage', 'category.manage', 'media.upload'
  ];
  const editorPerms = await prisma.permission.findMany({
    where: { key: { in: editorPermKeys } }
  });
  for (const perm of editorPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: editorRole.id, permissionId: perm.id }
      },
      update: {},
      create: { roleId: editorRole.id, permissionId: perm.id }
    });
  }

  // Gán quyền cho Moderator
  const modPermKeys = [
    'dashboard.view', 'comment.moderate', 'review.moderate', 'banned_word.manage'
  ];
  const modPerms = await prisma.permission.findMany({
    where: { key: { in: modPermKeys } }
  });
  for (const perm of modPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: moderatorRole.id, permissionId: perm.id }
      },
      update: {},
      create: { roleId: moderatorRole.id, permissionId: perm.id }
    });
  }
  console.log('   ✓ Đã hoàn tất cấu hình vai trò và ma trận quyền mẫu.');

  // 3. Seed Plans
  console.log('💎 3. Thiết lập các gói dịch vụ Premium...');
  await prisma.plan.upsert({
    where: { code: 'monthly' },
    update: { priceVnd: 49000, durationDays: 30 },
    create: {
      code: 'monthly',
      name: 'Gói Tháng (30 ngày)',
      durationDays: 30,
      priceVnd: 49000,
      isActive: true,
      features: {
        unlimited_reading: true,
        ai_quota_per_day: 100,
        audio_stream: true,
        ad_free: true
      }
    }
  });

  await prisma.plan.upsert({
    where: { code: 'yearly' },
    update: { priceVnd: 399000, durationDays: 365 },
    create: {
      code: 'yearly',
      name: 'Gói Năm (365 ngày)',
      durationDays: 365,
      priceVnd: 399000,
      isActive: true,
      features: {
        unlimited_reading: true,
        ai_quota_per_day: 100,
        audio_stream: true,
        ad_free: true,
        priority_support: true,
        yearly_discount_percent: 32
      }
    }
  });
  console.log('   ✓ Đã tạo gói tháng (49.000đ) và gói năm (399.000đ).');

  // 4. Seed Cấu hình Hệ thống
  console.log('⚙️ 4. Thiết lập System Settings...');
  const settings = [
    { key: 'ai_quota_member', value: 10 },
    { key: 'ai_quota_premium', value: 100 },
    { key: 'preview_paragraphs_default', value: 3 },
    { key: 'xp_levels', value: { '1': 0, '2': 100, '3': 300, '4': 700, '5': 1500 } },
    { key: 'maintenance_mode', value: false }
  ];
  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value }
    });
  }
  console.log('   ✓ Đã cập nhật System Settings.');

  // 5. Seed Super Admin (nếu cấu hình trong môi trường)
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    console.log(`👤 5. Khởi tạo Super Admin: ${adminEmail}...`);
    const passwordHash = await hashPassword(adminPassword);

    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {
        status: 'ACTIVE',
        passwordHash,
        emailVerifiedAt: new Date()
      },
      create: {
        email: adminEmail.toLowerCase(),
        passwordHash,
        displayName: 'Super Administrator',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        level: 5,
        xp: 9999
      }
    });

    // Gán role super_admin
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: adminUser.id, roleId: superAdminRole.id }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id
      }
    });
    console.log('   ✓ Đã khởi tạo Super Admin thành công.');
  } else {
    console.log('ℹ️ Bỏ qua tạo Super Admin (Chưa đặt SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD trong .env)');
  }

  console.log('🎉 Hoàn tất Seed Database thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi Seed Database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
