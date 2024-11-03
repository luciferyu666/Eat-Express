// src/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController'); // 從 orderController 導入控制器函數
const authenticate = require('../middleware/authenticate'); // 引入身份驗證中間件
const authorize = require('../middleware/authorize'); // 引入授權中間件
const mongoose = require('mongoose'); // 引入 mongoose 以進行 ID 驗證

// 獲取所有訂單（僅限管理員）
router.get(
  '/',
  authenticate,
  authorize('admin'),
  orderController.getAllOrders
);

// 根據 ID 獲取訂單（管理員、客戶、外送員）
router.get(
  '/:orderId',
  authenticate,
  authorize(['admin', 'customer', 'delivery_person']),
  (req, res, next) => {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: '無效的訂單 ID' });
    }
    next();
  },
  orderController.getOrderById
);

// 獲取當前用戶的訂單（客戶或外送員）
router.get(
  '/current',
  authenticate,
  authorize(['customer', 'delivery_person']),
  orderController.getCurrentOrders
);

// 創建訂單（僅客戶）
router.post(
  '/',
  authenticate,
  authorize(['customer']),
  // 根據您的 orderController.createOrder 的實現，可能需要添加驗證
  orderController.createOrder
);

// 更新訂單狀態（管理員、外送員）
router.put(
  '/:orderId/status',
  authenticate,
  authorize(['admin', 'delivery_person']),
  (req, res, next) => {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: '無效的訂單 ID' });
    }
    next();
  },
  // 添加狀態驗證
  (req, res, next) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `無效的狀態值，請選擇以下之一：${validStatuses.join(', ')}` });
    }
    next();
  },
  orderController.updateOrderStatus
);

// 刪除訂單（僅限管理員）
router.delete(
  '/:orderId',
  authenticate,
  authorize('admin'),
  (req, res, next) => {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: '無效的訂單 ID' });
    }
    next();
  },
  orderController.deleteOrder
);

module.exports = router;