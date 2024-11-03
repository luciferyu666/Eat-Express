// backend-project/middleware/authenticateSocket.js

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config'); // 引入配置文件中的 JWT_SECRET
// const logger = require('../utils/logger'); // 引入自定義 logger
const redisClient = require('../redisClient'); // 引入 Redis 客戶端

// 確保環境變量中的 JWT_SECRET 存在
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment variables');
}

/**
 * JWT 驗證中間件
 * 檢查 Socket.IO 連接中的 Token，驗證 Token 並將解碼後的用戶信息附加到 socket.user
 */
const authenticateSocket = async (socket, next) => {
  try {
    console.log("Entering middleware\\authenticateSocket.js");
    // 檢查 handshake 和 auth 是否存在
    if (!socket.handshake || !socket.handshake.auth) {
      console.warn('Socket 握手中缺少 auth 資料');
      console.log("Exiting middleware\\authenticateSocket.js with status code");
      return next(new Error('授權失敗，缺少 Token'));
    }

    let token = socket.handshake.auth.token;

    // 確保 Token 存在
    if (!token) {
      console.warn('Socket 握手中缺少 Token');
      console.log("Exiting middleware\\authenticateSocket.js with status code");
      return next(new Error('授權失敗，請提供 Token'));
    }

    // 如果 Token 前有 'Bearer ' 前綴，去掉它
    const cleanedToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    // 檢查 Token 是否在 Redis 黑名單中
    const isBlacklisted = await redisClient.get(cleanedToken);
    if (isBlacklisted) {
      console.warn('Socket 連接失敗：Token 已被黑名單化');
      console.log("Exiting middleware\\authenticateSocket.js with status code");
      return next(new Error('Token 已失效，請重新登入'));
    }

    // 驗證 Token
    const decoded = jwt.verify(cleanedToken, JWT_SECRET, { algorithms: ['HS256'] });

    // 將解碼後的用戶信息附加到 socket 對象上，僅保留必要的信息
    socket.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    console.info(`Socket 連接成功：用戶 ${decoded.userId}, 角色 ${decoded.role}`);
    next(); // 繼續執行後面的處理
  } catch (error) {
    // 打印更詳細的錯誤信息，僅在非生產環境中
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Socket JWT 驗證錯誤詳情: ${error}`);
    } else {
      console.error(`Socket JWT 驗證錯誤: ${error.message}`);
    }
    console.log("Exiting middleware\\authenticateSocket.js with status code");
    return next(new Error('授權失敗，無效 Token'));
  }
};

module.exports = authenticateSocket;
