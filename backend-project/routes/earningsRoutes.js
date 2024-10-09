const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { parse } = require('json2csv');  // 用於將數據轉換為 CSV 格式
const fs = require('fs');
const path = require('path');

// 獲取當日收益的 API
router.get('/daily', async (req, res) => {
  try {
    // 設置當天的時間範圍
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);  // 當天開始時間

    const orders = await Order.find({ createdAt: { $gte: startOfDay }, status: 'completed' });

    let totalOrders = orders.length;
    let totalEarnings = 0;
    let earningsDetails = [];

    // 計算當日收益
    orders.forEach(order => {
      const deliveryFee = order.deliveryFee || 0;
      const tip = order.tip || 0;
      const bonus = order.bonus || 0;
      const total = deliveryFee + tip + bonus;

      totalEarnings += total;

      earningsDetails.push({
        orderId: order._id,
        deliveryFee,
        tip,
        bonus,
        total,
      });
    });

    // 返回當日收益數據
    res.json({
      totalOrders,
      totalEarnings,
      earningsDetails,
    });
  } catch (error) {
    console.error('Error fetching daily earnings:', error);
    res.status(500).send('無法獲取每日收益');
  }
});

// 獲取歷史收益數據的 API
router.get('/history', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);  // 設置結束時間

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    });

    let totalOrders = orders.length;
    let totalEarnings = 0;
    let earningsDetails = [];

    // 計算歷史收益數據
    orders.forEach(order => {
      const deliveryFee = order.deliveryFee || 0;
      const tip = order.tip || 0;
      const bonus = order.bonus || 0;
      const total = deliveryFee + tip + bonus;

      totalEarnings += total;

      earningsDetails.push({
        orderId: order._id,
        deliveryFee,
        tip,
        bonus,
        total,
      });
    });

    // 返回歷史收益數據
    res.json({
      totalOrders,
      totalEarnings,
      earningsDetails,
    });
  } catch (error) {
    console.error('Error fetching history earnings:', error);
    res.status(500).send('無法獲取歷史收益');
  }
});

// 導出收益報表的 API
router.get('/export', async (req, res) => {
  const { startDate, endDate, format } = req.query;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);  // 設置結束時間

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    });

    const data = orders.map(order => ({
      orderId: order._id,
      deliveryFee: order.deliveryFee || 0,
      tip: order.tip || 0,
      bonus: order.bonus || 0,
      total: (order.deliveryFee || 0) + (order.tip || 0) + (order.bonus || 0),
    }));

    // 導出 CSV 格式
    if (format === 'csv') {
      const csv = parse(data);
      const filePath = path.join(__dirname, `../../exports/earnings-${Date.now()}.csv`);
      fs.writeFileSync(filePath, csv);

      res.download(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send('無法導出報表');
        }
        // 刪除臨時文件
        fs.unlinkSync(filePath);
      });
    } else {
      // 如果需要其他格式如 Excel，可以在這裡擴展
      res.status(400).send('目前僅支持 CSV 格式');
    }
  } catch (error) {
    console.error('Error exporting earnings:', error);
    res.status(500).send('無法導出報表');
  }
});

module.exports = router;
