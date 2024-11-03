// backend-project/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const moment = require('moment');  // 用於處理時間範圍的第三方庫
const { generateCSV, generateExcel } = require('../utils/exportUtils');  // 假設已經有一個導出工具
const { verifyToken } = require('../controllers/userController'); // 引入 verifyToken 中間件

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
  },
  dailySales: [
    { date: '2024-04-01', total: 1000 },
    { date: '2024-04-02', total: 1500 },
    { date: '2024-04-03', total: 1200 },
    // 更多數據...
  ],
  topDishes: [
    { name: '披薩', sales: 300 },
    { name: '漢堡', sales: 250 },
    // 更多數據...
  ]
};

// 獲取系統運營報表 API
router.get('/operation', verifyToken, (req, res) => {
  console.log('处理 GET /operation 请求');
  const { range, startDate, endDate } = req.query;

  // 根據時間範圍處理數據（模擬）
  const report = {
    totalOrders: reportsData.totalOrders,
    totalRevenue: reportsData.totalRevenue,
    successRate: reportsData.successRate,
    averageDeliveryTime: reportsData.averageDeliveryTime,
  };

  res.json(report);
});

// 獲取用戶行為分析 API
router.get('/user-behavior', verifyToken, (req, res) => {
  console.log('处理 GET /user-behavior 请求');
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
router.get('/restaurant-performance', verifyToken, (req, res) => {
  console.log('处理 GET /restaurant-performance 请求');
  const { range, startDate, endDate } = req.query;

  // 模擬邏輯處理
  const report = reportsData.restaurantPerformance;

  res.json(report);
});

// 新增獲取餐廳銷售報表 API
router.get('/restaurant/sale', verifyToken, (req, res) => {
  console.log('处理 GET /restaurant/sale 请求');
  const { range, startDate, endDate } = req.query;

  // 根據時間範圍處理數據（模擬）
  const report = {
    dailySales: reportsData.dailySales,
    topDishes: reportsData.topDishes,
  };

  res.json(report);
});

// 報表導出 API
router.get('/export', verifyToken, async (req, res) => {
  console.log('处理 GET /export 请求');
  const { range, format, startDate, endDate } = req.query;

  // 根據參數導出相應格式的報表
  try {
    console.log("Entering routes\\reportRoutes.js");
    console.log("Entering routes\\reportRoutes.js");
    console.log("Entering routes\\reportRoutes.js");
    console.log("Entering routes\\reportRoutes.js");
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
