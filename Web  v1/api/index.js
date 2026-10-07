/**
 * VERCEL SERVERLESS FUNCTION HANDLER
 * Chuyển tiếp các yêu cầu /api/* sang Node.js HTTP server handler
 */

const server = require('../server/index.js');

module.exports = (req, res) => {
  const handler = server.listeners('request')[0];
  if (handler) {
    handler(req, res);
  } else {
    res.statusCode = 500;
    res.end('Server handler not initialized');
  }
};
