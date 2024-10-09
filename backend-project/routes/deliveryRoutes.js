// routes/deliveryRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');  // 引入訂單模型

// 模擬收益數據
const earningsData = {
  daily: 50,
  weekly: 300,
};

// 模擬歷史訂單數據
const historyOrders = [
  { id: 1, deliveryDate: new Date('2023-09-21'), earnings: 25 },
  { id: 2, deliveryDate: new Date('2023-09-20'), earnings: 30 },
];

// 1. 獲取所有待處理訂單的 API
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'preparing' });  // 查找處於準備中的訂單
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('無法獲取訂單');
  }
});

// 2. 外送員接受訂單
router.put('/orders/:orderId/accept', async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send('訂單未找到');
    }

    // 更新訂單狀態為「配送中」
    order.status = 'outForDelivery';
    await order.save();

    // 通過 WebSocket 或其他方式通知訂單狀態更新
    req.io.emit('orderStatusUpdate', {
      orderId: order._id,
      status: order.status,
    });

    res.json(order);
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).send('無法接受訂單');
  }
});

// 3. 獲取當前訂單
router.get('/delivery/orders/current', async (req, res) => {
  try {
    const orders = await Order.find();  // 查找所有訂單
    const currentOrders = orders.map(order => {
      const customerLat = parseFloat(order.customerLat);  // 確保緯度是數字
      const customerLng = parseFloat(order.customerLng);  // 確保經度是數字

      // 驗證經緯度是否為有效數字
      if (isNaN(customerLat) || isNaN(customerLng)) {
        console.error('Invalid latitude or longitude:', { customerLat, customerLng });
        return null; // 跳過無效的訂單數據
      }

      return {
        id: order._id,
        customerLat,  // 使用已轉換的數字
        customerLng,  // 使用已轉換的數字
        customerAddress: order.customerAddress,
        restaurantAddress: order.restaurantAddress,
        items: order.items,  // 包含訂單項目
        status: order.status  // 包含訂單狀態
      };
    }).filter(order => order !== null);  // 過濾掉無效的訂單

    res.json(currentOrders);  // 返回訂單數據
  } catch (error) {
    console.error('Error fetching current orders:', error);
    res.status(500).send('無法獲取當前訂單');
  }
});

// 4. 獲取收益數據
router.get('/delivery/earnings', (req, res) => {
  res.json(earningsData);
});

// 5. 獲取歷史訂單
router.get('/delivery/orders/history', (req, res) => {
  res.json(historyOrders);
});

module.exports = router;
