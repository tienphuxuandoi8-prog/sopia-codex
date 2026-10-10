const { Resend } = require('resend');
const config = require('../config/env');
const logger = require('./logger');

const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;
const APP_URL = config.APP_URL || 'http://localhost:3000';
const FROM_EMAIL = config.FROM_EMAIL || 'noreply@sophiacodex.com';

/**
 * Helper function to send email or log if Resend is not configured
 * @param {Object} options Email options
 */
const sendEmail = async ({ to, subject, html }) => {
  if (resend) {
    try {
      await resend.emails.send({
        from: `Sophia Codex <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      logger.error('Error sending email with Resend:', error);
    }
  } else {
    logger.info('================ EMAIL MOCK ================');
    logger.info(`To: ${to}`);
    logger.info(`Subject: ${subject}`);
    logger.info(`Content: \n${html}`);
    logger.info('=============================================');
  }
};

/**
 * Gửi email xác thực tài khoản
 * @param {string} toEmail 
 * @param {string} token 
 * @param {string} displayName 
 */
const sendVerificationEmail = async (toEmail, token, displayName) => {
  const verifyLink = `${APP_URL}/verify-email.html?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcf9f2; padding: 20px; border: 1px solid #d4c4a8; border-radius: 8px;">
      <h2 style="color: #0b4b3c; text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Chào mừng đến với Sophia Codex</h2>
      <p style="color: #333;">Chào <strong>${displayName}</strong>,</p>
      <p style="color: #333;">Cảm ơn bạn đã tham gia cộng đồng của chúng tôi. Vui lòng xác thực email của bạn bằng cách nhấn vào nút bên dưới:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyLink}" style="background-color: #0b4b3c; color: #d4af37; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; border: 1px solid #d4af37;">Xác thực Email</a>
      </div>
      <p style="color: #333; font-size: 14px;">Nếu nút trên không hoạt động, bạn có thể copy và dán liên kết sau vào trình duyệt:</p>
      <p style="color: #666; font-size: 13px; word-break: break-all;">${verifyLink}</p>
      <hr style="border: 0; border-top: 1px solid #d4c4a8; margin: 20px 0;" />
      <p style="color: #888; font-size: 12px; text-align: center;">Sophia Codex - Tri thức vượt thời gian</p>
    </div>
  `;

  await sendEmail({
    to: toEmail,
    subject: 'Sophia Codex - Xác thực tài khoản của bạn',
    html
  });
};

/**
 * Gửi email khôi phục mật khẩu
 * @param {string} toEmail 
 * @param {string} token 
 */
const sendPasswordResetEmail = async (toEmail, token) => {
  const resetLink = `${APP_URL}/reset-password.html?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcf9f2; padding: 20px; border: 1px solid #d4c4a8; border-radius: 8px;">
      <h2 style="color: #0b4b3c; text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Yêu cầu khôi phục mật khẩu</h2>
      <p style="color: #333;">Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại Sophia Codex.</p>
      <p style="color: #333;">Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu. Liên kết này sẽ hết hạn trong vòng 30 phút.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #0b4b3c; color: #d4af37; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; border: 1px solid #d4af37;">Đặt lại mật khẩu</a>
      </div>
      <p style="color: #333; font-size: 14px;">Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
      <p style="color: #666; font-size: 13px; word-break: break-all;">${resetLink}</p>
      <hr style="border: 0; border-top: 1px solid #d4c4a8; margin: 20px 0;" />
      <p style="color: #888; font-size: 12px; text-align: center;">Sophia Codex - Tri thức vượt thời gian</p>
    </div>
  `;

  await sendEmail({
    to: toEmail,
    subject: 'Sophia Codex - Yêu cầu khôi phục mật khẩu',
    html
  });
};

/**
 * Gửi cảnh báo đổi mật khẩu
 * @param {string} toEmail 
 */
const sendPasswordChangedAlert = async (toEmail) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcf9f2; padding: 20px; border: 1px solid #d4c4a8; border-radius: 8px;">
      <h2 style="color: #0b4b3c; text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Cảnh báo bảo mật</h2>
      <p style="color: #333;">Mật khẩu tài khoản Sophia Codex của bạn vừa được thay đổi thành công.</p>
      <p style="color: #333;">Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ ngay với đội ngũ hỗ trợ của chúng tôi để bảo vệ tài khoản.</p>
      <hr style="border: 0; border-top: 1px solid #d4c4a8; margin: 20px 0;" />
      <p style="color: #888; font-size: 12px; text-align: center;">Sophia Codex - Tri thức vượt thời gian</p>
    </div>
  `;

  await sendEmail({
    to: toEmail,
    subject: 'Sophia Codex - Mật khẩu đã được thay đổi',
    html
  });
};

/**
 * Gửi biên lai thanh toán
 * @param {string} toEmail 
 * @param {Object} order 
 * @param {string} plan 
 */
const sendPaymentReceiptEmail = async (toEmail, order, plan) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcf9f2; padding: 20px; border: 1px solid #d4c4a8; border-radius: 8px;">
      <h2 style="color: #0b4b3c; text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Biên lai thanh toán</h2>
      <p style="color: #333;">Cảm ơn bạn đã nâng cấp tài khoản tại Sophia Codex. Dưới đây là thông tin biên lai của bạn:</p>
      <div style="background-color: #fff; padding: 15px; border-radius: 4px; border: 1px solid #ddd; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> ${order.id}</p>
        <p style="margin: 5px 0;"><strong>Gói dịch vụ:</strong> ${plan}</p>
        <p style="margin: 5px 0;"><strong>Ngày thanh toán:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
        <p style="margin: 5px 0;"><strong>Tổng tiền:</strong> ${order.amount} VND</p>
      </div>
      <p style="color: #333;">Chúc bạn có những trải nghiệm tuyệt vời cùng Sophia Codex!</p>
      <hr style="border: 0; border-top: 1px solid #d4c4a8; margin: 20px 0;" />
      <p style="color: #888; font-size: 12px; text-align: center;">Sophia Codex - Tri thức vượt thời gian</p>
    </div>
  `;

  await sendEmail({
    to: toEmail,
    subject: 'Sophia Codex - Biên lai thanh toán nâng cấp tài khoản',
    html
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedAlert,
  sendPaymentReceiptEmail
};
