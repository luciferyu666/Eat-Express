// backend-project/utils/authHelpers.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config'); // 引入配置中的 JWT_SECRET
// const logger = require('../utils/logger');

// 密碼加密
const hashPassword = async (password) => {
  try {
    const hashed = await bcrypt.hash(password, 10);
    return hashed;
  } catch (error) {
    console.error(`密碼加密失敗: ${error.message}`);
    throw new Error('密碼加密失敗');
  }
};

// 驗證密碼
const verifyPassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error(`密碼驗證失敗: ${error.message}`);
    throw new Error('密碼驗證失敗');
  }
};

// 生成 JWT Token
const generateToken = (userId, role, expiresIn = '2h') => {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET 未設置');
    throw new Error('JWT_SECRET 未設置');
  }

  try {
    const token = jwt.sign(
      {
        userId,
        role,
      },
      JWT_SECRET,
      { expiresIn, algorithm: 'HS256' }
    );

    console.info(`生成的 Token for user ${userId} with role ${role}: ${token}`);
    return token;
  } catch (error) {
    console.error(`Token 生成失敗: ${error.message}`);
    throw new Error('Token 生成失敗');
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
};
