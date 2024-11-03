// redisClient.js

const redis = require('redis');
const { REDIS_URL } = require('./config'); // 引入配置中的 REDIS_URL
// // 引入自定義 logger

// 創建 Redis 客戶端
const redisClient = redis.createClient({
  url: REDIS_URL,
});

// Redis 連接錯誤處理
redisClient.on('error', (err) => {
  console.error(`Redis 連接錯誤: ${err}`);
});

// 連接 Redis
(async () => {
  try {
    await redisClient.connect();
    console.info('已連接到 Redis');
  } catch (error) {
    console.error(`Redis 連接失敗: ${error.message}`);
    process.exit(1); // 無法連接到 Redis，退出進程
  }
})();

module.exports = redisClient;
