// backend/routes/authRoutes.js

const express = require('express');
const rateLimit = require('express-rate-limit'); // 引入 express-rate-limit
const router = express.Router();
const {
  registerCustomer,
  registerRestaurant,
  registerDeliveryPerson,
  registerAdmin,
  login,
  logout,
  verifyToken,
  refreshTokenController,
} = require('../controllers/userController');
const authorizeRoles = require('../middleware/authorizeRoles');
const ROLES = require('../constants/roles'); // 导入 ROLES 常量

// =======================
// 中间件
// =======================

/**
 * 日志中间件
 * 用于记录请求信息
 * @param {string} action - 请求的动作描述
 */
const logRequest = (action) => (req, res, next) => {
  console.info(`${action} 请求路径: ${req.originalUrl}, 方法: ${req.method}, IP: ${req.ip}`);
  next();
};

// 速率限制器配置
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message,
  standardHeaders: true,
  legacyHeaders: false,
});

// 对注册和登录路由应用速率限制
const registerLimiter = createRateLimiter(15 * 60 * 1000, 10, '注册尝试过于频繁，请稍后再试。');
const loginLimiter = createRateLimiter(15 * 60 * 1000, 10, '登录尝试过于频繁，请稍后再试。');
const refreshTokenLimiter = createRateLimiter(15 * 60 * 1000, 20, '刷新 Token 尝试过于频繁，请稍后再试。');

// =======================
// 用户注册路由
// =======================

// 顾客注册路由 - 允许匿名访问
router.post(
  '/register/customer',
  registerLimiter,
  logRequest('Customer Registration'),
  registerCustomer
);

// 餐厅注册路由 - 允许匿名访问
router.post(
  '/register/restaurant',
  registerLimiter,
  logRequest('Restaurant Registration'),
  registerRestaurant
);

// 外送员注册路由 - 允许匿名访问
router.post(
  '/register/delivery-person',
  registerLimiter,
  logRequest('Delivery Person Registration'),
  registerDeliveryPerson
);

// 管理员注册路由（仅限已验证的管理员）
router.post(
  '/register/admin',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  registerLimiter,
  logRequest('Admin Registration'),
  registerAdmin
);

// =======================
// 用户登录路由
// =======================

// 统一登录路由（适用于所有角色） - 允许匿名访问
router.post(
  '/login',
  loginLimiter,
  logRequest('User Login'),
  login
);

// =======================
// 刷新 Token 路由
// =======================

// 刷新 Token 路由（不需要 verifyToken 中间件）
router.post(
  '/refresh-token',
  refreshTokenLimiter,
  logRequest('Token Refresh'),
  refreshTokenController
);

// =======================
// 登出路由
// =======================

// 登出路由（仅限已验证用户）
router.post(
  '/logout',
  verifyToken,
  logRequest('User Logout'),
  logout
);

// =======================
// 受保护的测试路由
// =======================

router.get(
  '/protected',
  verifyToken,
  logRequest('Protected Route Access'),
  (req, res) => {
    console.log('处理 GET /protected 请求');
    console.log('处理 GET /protected 请求');
    console.info(`Protected route accessed by user ID: ${req.userId}`);
    res.json({ message: '你已成功访问受保护的路由' });
  }
);

module.exports = router;