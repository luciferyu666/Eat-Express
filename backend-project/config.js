// backend-project/config.js
require('dotenv').config(); // 加載 .env 文件中的環境變量

// 打印環境變量以進行驗證（僅用於調試，確保不在生產環境中暴露這些信息）
if (process.env.NODE_ENV !== 'production') {
  console.log('config.js - Loaded JWT_SECRET:', process.env.JWT_SECRET);
}

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET, // 導出 JWT_SECRET
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/food-delivery-app',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
