const express = require('express');
const router = express.Router();
const Order = require('../models/Order');  // 假設有一個訂單模型

// 獲取銷售數據 API
router.get('/', async (req, res) => {
  const { range } = req.query;  // 獲取查詢參數
  let startDate;
  const today = new Date();

  // 根據 range 設定查詢的起始時間
  switch (range) {
    case 'weekly':
      startDate = new Date(today.setDate(today.getDate() - 7));  // 一週前
      break;
    case 'monthly':
      startDate = new Date(today.setMonth(today.getMonth() - 1));  // 一個月前
      break;
    case 'daily':
    default:
      startDate = new Date(today.setDate(today.getDate() - 1));  // 一天前
  }

  try {
    // 查詢在特定時間範圍內的訂單
    const orders = await Order.find({ createdAt: { $gte: startDate } })
      .populate('items.dish', 'name price');  // 查詢訂單並填充菜品詳細數據

    // 計算銷售數據
    let totalOrders = orders.length;
    let totalRevenue = 0;
    const dishSales = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const dishId = item.dish._id;
        const dishName = item.dish.name;
        const dishRevenue = item.dish.price * item.quantity;
        totalRevenue += dishRevenue;

        // 初始化或更新菜品銷售數據
        if (!dishSales[dishId]) {
          dishSales[dishId] = { name: dishName, quantity: 0, totalRevenue: 0 };
        }

        dishSales[dishId].quantity += item.quantity;
        dishSales[dishId].totalRevenue += dishRevenue;
      });
    });

    // 計算平均訂單金額
    const averageOrderValue = totalRevenue / totalOrders;
    
    // 將菜品銷售數據轉換為數組格式
    const sales = Object.keys(dishSales).map(dishId => ({
      dishId,
      name: dishSales[dishId].name,
      quantity: dishSales[dishId].quantity,
      totalRevenue: dishSales[dishId].totalRevenue
    }));

    // 回應結果
    res.json({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      sales
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).send('無法獲取銷售數據');
  }
});

module.exports = router;