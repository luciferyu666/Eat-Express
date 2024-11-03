// backend-project/routes/deliveryRoutes.js

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/userController'); // 从 authController 导入 verifyToken
const {
  getPendingOrders,
  acceptOrder,
  getCurrentOrders,
  getEarnings,
  getOrderHistory, // 修正函数名
} = require('../controllers/userController'); // 从 deliveryPersonController 导入控制器函数

const authorizeRoles = require('../middleware/authorizeRoles'); // 从 middleware 导入 authorizeRoles
// const logger = require('../utils/logger'); // 引入自定义 logger

// 获取所有待处理订单的 API（仅限外送员和管理员）
router.get('/order', verifyToken, authorizeRoles('delivery_person', 'admin'), getPendingOrders);

// 外送员接受订单（仅限外送员）
router.put('/order/:orderId/accept', verifyToken, authorizeRoles('delivery_person'), acceptOrder);

// 获取当前订单（仅限外送员）
router.get('/order/current', verifyToken, authorizeRoles('delivery_person'), getCurrentOrders);

// 获取收益数据（仅限外送员）
router.get('/earning', verifyToken, authorizeRoles('delivery_person'), getEarnings);

// 获取历史订单（仅限外送员）
router.get('/order/history', verifyToken, authorizeRoles('delivery_person'), getOrderHistory); // 修正函数名

module.exports = router;
