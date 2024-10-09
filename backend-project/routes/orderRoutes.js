// orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');  // 引入訂單模型
const verifyToken = require('../middleware/verifyToken');  // 引入驗證中間件

// 用戶下單（需要身份驗證）
router.post('/create', verifyToken, async (req, res) => {
  const { userId, restaurantId, items, deliveryAddress, paymentMethod } = req.body;
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    const newOrder = new Order({
      userId,
      restaurant: restaurantId,
      items,
      deliveryAddress,
      paymentMethod,
      status: 'waiting', // 訂單初始狀態為 "等待接單"
      totalPrice,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ error: '無法創建訂單' });
  }
});

// 餐廳接單（需要身份驗證）
router.post('/:orderId/accept', verifyToken, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: '訂單未找到' });
    }

    // 更新訂單狀態為「製作中」
    order.status = 'preparing';
    await order.save();

    // 通知系統訂單狀態已更新
    req.app.get('io').to(orderId).emit('orderStatusUpdate', { orderId: order._id, status: order.status });

    res.json({ message: '餐廳已接單', order });
  } catch (error) {
    res.status(500).json({ error: '無法更新訂單狀態' });
  }
});

// 外送員更新訂單狀態（需要身份驗證）
router.post('/:orderId/status', verifyToken, async (req, res) => {
  const { orderId } = req.params;
  const { status, deliveryLocation } = req.body;  // 新的訂單狀態和可選的外送員實時位置

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: '訂單未找到' });
    }

    // 更新訂單狀態和配送位置（如果提供）
    order.status = status;
    if (deliveryLocation) {
      order.deliveryLocation = deliveryLocation;
    }
    await order.save();

    // 通知系統訂單狀態已更新，並推送實時位置
    req.app.get('io').to(orderId).emit('orderStatusUpdate', { orderId: order._id, status: order.status, deliveryLocation });

    res.json({ message: '訂單狀態已更新', order });
  } catch (error) {
    res.status(500).json({ error: '無法更新訂單狀態' });
  }
});

// 查詢訂單狀態（需要身份驗證）
router.get('/:orderId', verifyToken, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId)
      .populate('restaurant')
      .populate('items.dish')
      .populate('userId');
    if (!order) {
      return res.status(404).json({ error: '訂單未找到' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: '無法獲取訂單詳情' });
  }
});

module.exports = router;
