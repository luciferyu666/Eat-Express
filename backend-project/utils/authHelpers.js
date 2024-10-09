// utils/authHelpers.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config'); // 引入配置中的 JWT_SECRET

// 確保加載環境變量，並打印 JWT_SECRET 以確認其值 (僅用於調試，生產環境請移除此代碼)
if (process.env.NODE_ENV !== 'production') {
  console.log('authHelpers - Loaded JWT_SECRET:', JWT_SECRET);
}

// 密碼加密
const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error('密碼加密失敗:', error);
    throw new Error('密碼加密失敗');
  }
};

// 驗證密碼
const verifyPassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('密碼驗證失敗:', error);
    throw new Error('密碼驗證失敗');
  }
};

// 生成 JWT Token
const generateToken = (userId, role, expiresIn = '1h') => {
  // 檢查 JWT_SECRET 是否已正確設置
  if (!JWT_SECRET) {
    console.error('JWT_SECRET 未設置');
    throw new Error('JWT_SECRET 未設置');
  }

  const currentTime = Math.floor(Date.now() / 1000); // 獲取當前時間的 Unix 時間戳（秒）

  try {
    // 生成 Token，並添加 `iat`（issued at）字段
    const token = jwt.sign(
      {
        userId,
        role,
        iat: currentTime // 添加生成時間戳
      },
      JWT_SECRET,
      { expiresIn, algorithm: 'HS256' }
    );

    // 打印 Token 生成的時間和 Token 本身，用於調試
    console.log(`Token 生成於: ${new Date(currentTime * 1000).toISOString()}`);
    console.log(`生成的 Token for user ${userId} with role ${role}:`, token);

    return token;
  } catch (error) {
    console.error('Token 生成失敗:', error);
    throw new Error('Token 生成失敗');
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
};
