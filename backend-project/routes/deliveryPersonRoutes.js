// backend-project/routes/deliveryPersonRoutes.js

const express = require('express');
const { ROLES } = require('../utils/constants'); // 引入统一的角色常量
const deliveryPersonController = require('../controllers/deliveryPersonController');
const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validateObjectId } = require('../middleware/validateObjectId');
// const logger = require('../utils/logger'); // 移除日志工具的引用

const router = express.Router();

// 统一应用认证中间件
router.use(authenticate);

// 统一记录请求日志
router.use((req, res, next) => {
  console.log(`DeliveryPersonRoutes: ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * 路由定义
 */

// 1. 获取所有外送员的位置（仅限管理员）
router.get(
  '/location',
  authorizeRoles(ROLES.ADMIN),
  deliveryPersonController.getAllDeliveryPersonsLocations
);

// 2. 获取外送员的订单历史（仅限外送员本人或管理员）
router.get(
  '/order-history',
  authorizeRoles(ROLES.ADMIN, ROLES.DELIVERY_PERSON),
  deliveryPersonController.getOrderHistory
);

// 3. 获取在线状态
router.get(
  '/status',
  authorizeRoles(ROLES.ADMIN, ROLES.DELIVERY_PERSON),
  deliveryPersonController.getStatus
);

// 4. 更新在线状态
router.patch(
  '/status',
  authorizeRoles(ROLES.ADMIN, ROLES.DELIVERY_PERSON),
  deliveryPersonController.updateStatus
);

// 4.1 更新外送员位置
router.patch(
  '/location',
  authorizeRoles(ROLES.ADMIN, ROLES.DELIVERY_PERSON),
  deliveryPersonController.updateLocation
);

// 5. 获取当前订单
router.get(
  '/current-order',
  authorizeRoles(ROLES.ADMIN, ROLES.DELIVERY_PERSON),
  deliveryPersonController.getCurrentOrders
);

// 6. 获取外送员的个人资料
router.get(
  '/profile',
  authorizeRoles(ROLES.ADMIN, ROLES.DELIVERY_PERSON),
  deliveryPersonController.getDeliveryPersonProfile
);

// 7. 获取所有外送员（仅限管理员）
router.get(
  '/',
  authorizeRoles(ROLES.ADMIN),
  deliveryPersonController.getAllDeliveryPersons
);

// 8. 根据 ID 获取外送员（管理员或外送员本人）
router.get(
  '/:personId',
  authorizeRoles(ROLES.ADMIN, ROLES.DELIVERY_PERSON),
  validateObjectId('personId'),
  deliveryPersonController.getDeliveryPersonById
);

// 9. 更新外送员信息（管理员或外送员本人）
router.put(
  '/:personId',
  authorizeRoles(ROLES.ADMIN, ROLES.DELIVERY_PERSON),
  validateObjectId('personId'),
  deliveryPersonController.updateDeliveryPerson
);

// 10. 禁用外送员（仅限管理员）
router.patch(
  '/:personId/disable',
  authorizeRoles(ROLES.ADMIN),
  validateObjectId('personId'),
  deliveryPersonController.disableDeliveryPerson
);

// 11. 启用外送员（仅限管理员）
router.patch(
  '/:personId/enable',
  authorizeRoles(ROLES.ADMIN),
  validateObjectId('personId'),
  deliveryPersonController.enableDeliveryPerson
);

module.exports = router;