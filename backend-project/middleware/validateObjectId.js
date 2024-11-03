// backend-project/middleware/validateObjectId.js

const mongoose = require('mongoose');

/**
 * 中间件：验证 MongoDB ObjectId
 * @param {string} paramName - 请求参数中的参数名
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `无效的 ${paramName}` });
    }
    next();
  };
};

module.exports = { validateObjectId };
