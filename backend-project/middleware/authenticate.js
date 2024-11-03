// backend-project/middleware/authenticate.js

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config'); // 引用配置文件中的 JWT_SECRET
// const logger = require('../utils/logger'); // 引入自定義 logger

// 確保 JWT_SECRET 已設置
if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET in configuration');
  throw new Error('Missing JWT_SECRET in configuration');
}

/**
 * JWT 驗證中間件
 * 檢查請求中的 Authorization 標頭，驗證 JWT，並將用戶資訊添加到 req.user
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 檢查 Authorization 標頭是否存在
  if (!authHeader) {
    console.warn('授權失敗：缺少 Authorization 標頭');
    return res.status(401).json({ error: '授權失敗：缺少 Authorization 標頭' });
  }

  // 檢查 Authorization 標頭格式是否正確
  if (!authHeader.startsWith('Bearer ')) {
    console.warn('授權失敗：Authorization 標頭格式錯誤');
    return res.status(401).json({ error: '授權失敗：Authorization 標頭格式錯誤' });
  }

  // 提取 Token
  const token = authHeader.split(' ')[1];

  // 為了安全起見，不記錄完整的 Token
  console.info('收到一個有效的 Bearer Token');

  try {
    console.log("Entering middleware\\authenticate.js");
    // 驗證 Token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 檢查解碼後的 Token 是否包含必要的用戶資訊
    if (!decoded.userId || !decoded.role) {
      console.warn('授權失敗：Token 缺少必要的用戶資訊');
      console.log("Exiting middleware\\authenticate.js with status code");
      return res.status(401).json({ error: '授權失敗：Token 無效' });
    }

    // 可選：根據需要，添加更多的用戶資訊到 req.user
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      // 例如，如果 Token 中還包含其他資訊，可以在此添加
      // email: decoded.email,
      // username: decoded.username,
    };

    console.info(`用戶已成功認證，User ID: ${req.user.userId}, Role: ${req.user.role}`);

    next();
  } catch (error) {
    console.warn(`授權失敗：無效的 Token (${error.message})`);
    console.log("Exiting middleware\\authenticate.js with status code");
    return res.status(401).json({ error: '授權失敗：無效的 Token' });
  }
};

module.exports = authenticate;
