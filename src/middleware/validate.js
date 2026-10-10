const { ZodError } = require('zod');

/**
 * Factory middleware để xác thực request data sử dụng Zod schema.
 * Hỗ trợ linh hoạt:
 * 1. validate(zodSchema, 'query' | 'params' | 'body')
 * 2. validate({ query: zodSchema, params: zodSchema, body: zodSchema })
 *
 * @param {Object} schema Zod schema hoặc object chứa { query, params, body }
 * @param {string} [source] Nguồn dữ liệu cần validate nếu schema là Zod direct schema ('query' | 'params' | 'body')
 */
const validate = (schema, source) => async (req, res, next) => {
  try {
    if (source) {
      if (source === 'params' && req.params) {
        req.params = await schema.parseAsync(req.params);
      } else if (source === 'query' && req.query) {
        req.query = await schema.parseAsync(req.query);
      } else if (source === 'body' && req.body) {
        req.body = await schema.parseAsync(req.body);
      }
      return next();
    }

    // Trường hợp schema là object { query, params, body }
    if (schema.params) {
      req.params = await schema.params.parseAsync(req.params);
    }
    if (schema.query) {
      req.query = await schema.query.parseAsync(req.query);
    }
    if (schema.body) {
      req.body = await schema.body.parseAsync(req.body);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
module.exports.validate = validate;
