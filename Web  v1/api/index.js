// Vercel serverless function entry point
const app = require('../src/app');

// Xuất app Express như là một hàm xử lý để Vercel sử dụng
module.exports = app;
