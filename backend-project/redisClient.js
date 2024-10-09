// redisClient.js

const redis = require('redis');
require('dotenv').config(); // 確保能夠讀取 .env 文件中的環境變量

// 創建 Redis 客戶端
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Redis 連接錯誤處理
redisClient.on('error', (err) => {
  console.error('Redis 連接錯誤:', err);
});

// 連接 Redis
redisClient.connect()
  .then(() => {
    console.log('Connected to Redis');
  })
  .catch((err) => {
    console.error('Redis 連接失敗:', err);
  });

module.exports = redisClient;
