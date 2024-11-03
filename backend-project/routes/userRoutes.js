// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');  // 引入用戶模型
const verifyToken = require('../middleware/verifyToken');  // 引入驗證中間件

// 引入已創建的 Redis 客戶端
const redisClient = require('../redisClient');  // 根據您的項目結構調整路徑

// 註冊新用戶
router.post('/register', async (req, res) => {
  console.log('处理 POST /register 请求');
  const { username, email, password, addresses, role } = req.body;

  try {
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    const newUser = new User({ username, email, password, addresses, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: '註冊失敗' });
  }
});

// 獲取所有用戶列表（需要身份驗證）
router.get('/', verifyToken, async (req, res) => {
  console.log('处理 GET / 请求');
  try {
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: '無法獲取用戶列表' });
  }
});

// 獲取單一用戶資料（需要身份驗證）
router.get('/:userId', verifyToken, async (req, res) => {
  console.log('处理 GET /:userId 请求');
  try {
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      return res.status(404).json({ error: '用戶未找到' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '無法獲取用戶資料' });
  }
});

// 更新用戶信息（需要身份驗證）
router.put('/:userId', verifyToken, async (req, res) => {
  console.log('处理 PUT /:userId 请求');
  const { userId } = req.params;
  const updatedData = req.body;

  try {
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    if (!user) {
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      return res.status(404).json({ error: '用戶未找到' });
    }
    res.json({ message: '用戶信息已更新', user });
  } catch (error) {
    res.status(500).json({ error: '無法更新用戶信息' });
  }
});

// 刪除用戶（需要身份驗證）
router.delete('/:userId', verifyToken, async (req, res) => {
  console.log('处理 DELETE /:userId 请求');
  const { userId } = req.params;

  try {
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      return res.status(404).json({ error: '用戶未找到' });
    }
    res.json({ message: '用戶已刪除' });
  } catch (error) {
    res.status(500).json({ error: '無法刪除用戶' });
  }
});

// 獲取用戶常用地址的 API，並添加 Redis 快取邏輯
router.get('/:userId/addresses', verifyToken, async (req, res) => {
  console.log('处理 GET /:userId/addresses 请求');
  const { userId } = req.params;

  try {
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    // 檢查 Redis 中是否有用戶的地址快取
    const cache = await redisClient.get(`user:${userId}:addresses`);
    if (cache) {
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      // Redis 中有快取，直接返回
      return res.json(JSON.parse(cache));
    } else {
      // Redis 中無快取，查詢 MongoDB
      const user = await User.findById(userId).select('addresses');
      if (!user) {
        console.log("Exiting routes\\userRoutes.js with status code");
        console.log("Exiting routes\\userRoutes.js with status code");
        console.log("Exiting routes\\userRoutes.js with status code");
        console.log("Exiting routes\\userRoutes.js with status code");
        return res.status(404).json({ error: '用戶未找到' });
      }

      // 存儲到 Redis，設置有效期為 1 小時（3600 秒）
      await redisClient.setEx(`user:${userId}:addresses`, 3600, JSON.stringify(user.addresses));
      res.json(user.addresses);
    }
  } catch (error) {
    res.status(500).json({ error: '無法獲取用戶地址' });
  }
});

// 更新用戶地址（並清除 Redis 快取）
router.put('/:userId/addresses', verifyToken, async (req, res) => {
  console.log('处理 PUT /:userId/addresses 请求');
  const { userId } = req.params;
  const { addresses } = req.body;

  try {
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    console.log("Entering routes\\userRoutes.js");
    const user = await User.findByIdAndUpdate(userId, { addresses }, { new: true });
    if (!user) {
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      console.log("Exiting routes\\userRoutes.js with status code");
      return res.status(404).json({ error: '用戶未找到' });
    }

    // 更新後清除 Redis 快取
    await redisClient.del(`user:${userId}:addresses`);
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ error: '無法更新用戶地址' });
  }
});

module.exports = router;