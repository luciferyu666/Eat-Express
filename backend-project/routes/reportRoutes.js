// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const moment = require('moment');  // 用於處理時間範圍的第三方庫
const { generateCSV, generateExcel } = require('../utils/exportUtils');  // 假設已經有一個導出工具

// 模擬數據源
const reportsData = {
  totalOrders: 1500,
  totalRevenue: 50000,
  successRate: 95,
  averageDeliveryTime: 25,
  dailyActiveUsers: 350,
  newUsers: 50,
  mostOrderedDishes: [
    { dishName: '披薩', orderedTimes: 100 },
    { dishName: '漢堡', orderedTimes: 85 },
  ],
  restaurantPerformance: {
    restaurantId: '60db1234567890abcdef1234',
    restaurantName: 'Happy Sushi',
    totalOrders: 500,
    totalRevenue: 20000,
    averageRating: 4.5
  }
};

// 獲取系統運營報表 API
router.get('/operations', (req, res) => {
  const { range, startDate, endDate } = req.query;

  // 模擬數據邏輯可以根據時間範圍進行數據處理
  const report = {
    totalOrders: reportsData.totalOrders,
    totalRevenue: reportsData.totalRevenue,
    successRate: reportsData.successRate,
    averageDeliveryTime: reportsData.averageDeliveryTime,
  };

  res.json(report);
});

// 獲取用戶行為分析 API（修改名稱為 `/user-behavior`）
router.get('/user-behavior', (req, res) => {
  const { range, startDate, endDate } = req.query;

  // 模擬邏輯處理
  const report = {
    dailyActiveUsers: reportsData.dailyActiveUsers,
    newUsers: reportsData.newUsers,
    mostOrderedDishes: reportsData.mostOrderedDishes,
  };

  res.json(report);
});

// 獲取餐廳表現分析 API
router.get('/restaurant-performance', (req, res) => {
  const { range, startDate, endDate } = req.query;

  // 模擬邏輯處理
  const report = reportsData.restaurantPerformance;

  res.json(report);
});

// 獲取系統運營報告 API（來自示例代碼）
router.get('/system-operation', (req, res) => {
  // 這裡應包含返回系統運營報告的邏輯
  res.status(200).json({
    message: 'System operation report data',
    // 可以返回一些模擬數據來測試
    totalOrders: 100,
    activeUsers: 50,
    totalRevenue: 5000,
  });
});

// 報表導出 API
router.get('/export', async (req, res) => {
  const { range, format, startDate, endDate } = req.query;

  // 根據參數導出相應格式的報表
  try {
    let fileUrl;
    if (format === 'csv') {
      fileUrl = await generateCSV(reportsData);
    } else if (format === 'excel') {
      fileUrl = await generateExcel(reportsData);
    }

    res.json({ downloadUrl: fileUrl });
  } catch (error) {
    res.status(500).send({ error: '報表導出失敗' });
  }
});

module.exports = router;
