// middleware/authenticateSocket.js

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config'); // 引入配置文件中的 JWT_SECRET

// 確保環境變量中的 JWT_SECRET 存在
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment variables');
}

// 僅在非生產環境中打印 JWT_SECRET 以確認其一致性
if (process.env.NODE_ENV !== 'production') {
  console.log('authenticateSocket JWT_SECRET:', JWT_SECRET);
}

/**
 * JWT 驗證中間件
 * 檢查 Socket.IO 連接中的 Token，驗證 Token 並將解碼後的用戶信息附加到 socket.user
 */
const authenticateSocket = (socket, next) => {
  // 檢查 handshake 和 auth 是否存在
  if (!socket.handshake || !socket.handshake.auth) {
    console.error('Socket 握手中缺少 auth 資料');
    return next(new Error('授權失敗，缺少 Token'));
  }

  let token = socket.handshake.auth.token;

  // 確保 Token 存在
  if (!token) {
    console.error('Socket 握手中缺少 Token');
    return next(new Error('授權失敗，請提供 Token'));
  }

  // 如果 Token 前有 'Bearer ' 前缀，去掉它
  token = token.startsWith('Bearer ') ? token.slice(7) : token;

  // 使用 JWT 秘密密鑰來驗證 Token 是否有效
  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      // 打印更詳細的錯誤信息，僅在非生產環境中
      if (process.env.NODE_ENV !== 'production') {
        console.error('Socket JWT 驗證錯誤詳情:', err);
      } else {
        console.error('Socket JWT 驗證錯誤:', err.message);
      }
      return next(new Error('授權失敗，無效 Token'));
    }

    // 僅在非生產環境中打印解碼後的用戶信息
    if (process.env.NODE_ENV !== 'production') {
      console.log('Socket 驗證成功，用戶信息:', decoded);
    }

    // 將解碼後的用戶信息附加到 socket 對象上，僅保留必要的信息
    socket.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next(); // 繼續執行後面的處理
  });
};

module.exports = authenticateSocket; // 確保這裡是導出 authenticateSocket 函數
