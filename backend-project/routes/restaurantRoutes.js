// backend-project/routes/restaurantRoutes.js

const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const { body, param, query, validationResult } = require('express-validator');
// const logger = require('../utils/logger');

// 通用的验证错误处理中间件
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array()[0].msg;
    console.warn(`数据验证失败: ${errorMsg}`);
    return res.status(400).json({ success: false, error: errorMsg });
  }
  next();
};

// 获取热门餐厅（带有 Redis 缓存逻辑）
router.get('/popular', restaurantController.getPopularRestaurants);

// 获取附近餐厅
router.get(
  '/nearby',
  [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('无效的纬度'),
    query('lng').isFloat({ min: -180, max: 180 }).withMessage('无效的经度'),
    query('radius').optional().isInt({ min: 1 }).withMessage('无效的半径'),
    validateRequest,
  ],
  restaurantController.getNearbyRestaurants
);

// 获取指定餐厅的菜单
router.get(
  '/:restaurantId/menu',
  [
    param('restaurantId').isMongoId().withMessage('无效的餐厅 ID'),
    validateRequest,
  ],
  restaurantController.getRestaurantMenu
);

// 获取所有餐厅列表
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页数必须为正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('限制必须在 1 到 100 之间'),
    validateRequest,
  ],
  restaurantController.getAllRestaurants
);

// 新增餐厅（需要身份验证和授权）
router.post(
  '/add',
  verifyToken,
  authorizeRoles('admin', 'restaurant_owner'),
  [
    body('name').notEmpty().withMessage('餐厅名称是必需的'),
    body('address').notEmpty().withMessage('餐厅地址是必需的'),
    // 其他验证规则
    validateRequest,
  ],
  restaurantController.addRestaurant
);

// 更新餐厅信息（需要身份验证和授权）
router.put(
  '/:restaurantId',
  verifyToken,
  authorizeRoles('admin', 'restaurant_owner'),
  [
    param('restaurantId').isMongoId().withMessage('无效的餐厅 ID'),
    // 其他验证规则
    validateRequest,
  ],
  restaurantController.updateRestaurant
);

// 禁用餐厅（需要身份验证和授权）
router.put(
  '/:restaurantId/disable',
  verifyToken,
  authorizeRoles('admin'),
  [
    param('restaurantId').isMongoId().withMessage('无效的餐厅 ID'),
    validateRequest,
  ],
  restaurantController.disableRestaurant
);

// 获取餐厅表现数据（需要身份验证和授权）
router.get(
  '/performance',
  verifyToken,
  authorizeRoles('admin', 'restaurant_owner'),
  restaurantController.getRestaurantPerformance
);

// 获取餐厅资料
router.get(
  '/profile/:id',
  verifyToken,
  [
    param('id').isMongoId().withMessage('无效的餐厅 ID'),
    validateRequest,
  ],
  restaurantController.getRestaurantProfile
);

// 获取销售数据
router.get(
  '/sale/:id',
  verifyToken,
  [
    param('id').isMongoId().withMessage('无效的餐厅 ID'),
    // 其他验证规则
    validateRequest,
  ],
  restaurantController.getSalesData
);

// 获取通知
router.get(
  '/notification/:id',
  verifyToken,
  [
    param('id').isMongoId().withMessage('无效的餐厅 ID'),
    validateRequest,
  ],
  restaurantController.getNotifications
);

// 获取员工数据
router.get(
  '/employee/:id',
  verifyToken,
  [
    param('id').isMongoId().withMessage('无效的餐厅 ID'),
    validateRequest,
  ],
  restaurantController.getEmployees
);

// 获取当前用户的餐厅资料
router.get(
  '/profile',
  verifyToken,
  restaurantController.getCurrentRestaurantProfile
);

module.exports = router;