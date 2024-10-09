// middleware/verifyToken.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config'); // 引入配置文件中的 JWT_SECRET

// 確保環境變量中的 JWT_SECRET 存在
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment variables');
}

// 在非生產環境中打印 JWT_SECRET，以確認其一致性
if (process.env.NODE_ENV !== 'production') {
  console.log('verifyToken JWT_SECRET:', JWT_SECRET);
}

/**
 * JWT 驗證中間件
 * 檢查請求中的 Authorization 標頭，驗證 Token 並將解碼後的用戶信息附加到 req.user
 */
const verifyToken = (req, res, next) => {
  // 從請求標頭中提取 token，標頭中的格式是 "Bearer <token>"
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.error('授權失敗，未提供 Authorization 標頭');
    return res.status(403).json({ error: '授權失敗，請提供 Token' });
  }

  // 確保 Token 的格式為 "Bearer <token>"，提取真正的 Token 值
  const tokenParts = authHeader.split(' ');
  
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    console.error('授權失敗，Token 格式不正確:', authHeader);
    return res.status(401).json({ message: 'Token 格式不正確，請提供有效的 Token' });
  }

  const token = tokenParts[1];

  // 打印收到的 Token 以便排查問題
  console.log('收到的 Token:', token);

  // 使用 JWT 秘密密鑰來驗證 Token 是否有效
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT 驗證錯誤:', err.message, '詳細錯誤信息:', err);
      return res.status(403).json({ message: 'Token 無效或已過期' });
    }

    // 打印解碼後的用戶信息以便排查問題
    console.log('JWT 驗證成功，解碼後的用戶信息:', user);

    // 將解碼後的用戶信息附加到請求對象上，供後續的處理使用
    req.user = user;
    next(); // 繼續執行後面的處理
  });
};

module.exports = verifyToken; // 確保這裡是導出 verifyToken 函數