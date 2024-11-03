// routes/dishRoutes.js

const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const { body, param, query, validationResult } = require('express-validator');
// const logger = require('../utils/logger');

// 獲取熱門菜品
router.get(
  '/popular',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('頁數必須為正整數'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('限制必須在 1 到 100 之間'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn(`獲取熱門菜品時數據驗證失敗: ${errors.array()[0].msg}`);
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }
    next();
  },
  dishController.getPopularDishes
);

// 新增菜品
router.post(
  '/',
  verifyToken,
  authorizeRoles('admin', 'restaurant_owner'),
  [
    body('name').notEmpty().withMessage('菜品名稱是必需的'),
    body('price').isFloat({ gt: 0 }).withMessage('價格必須是大於 0 的數字'),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('imageUrl').optional().isURL().withMessage('無效的圖片網址'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn(`新增菜品時數據驗證失敗: ${errors.array()[0].msg}`);
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }
    next();
  },
  dishController.addDish
);

// 刪除菜品
router.delete(
  '/:dishId',
  verifyToken,
  authorizeRoles('admin', 'restaurant_owner'),
  [
    param('dishId').isMongoId().withMessage('無效的菜品 ID'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn(`刪除菜品時數據驗證失敗: ${errors.array()[0].msg}`);
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }
    next();
  },
  dishController.deleteDish
);

// 更新菜品信息
router.put(
  '/:dishId',
  verifyToken,
  authorizeRoles('admin', 'restaurant_owner'),
  [
    param('dishId').isMongoId().withMessage('無效的菜品 ID'),
    body('name').optional().isString(),
    body('price').optional().isFloat({ gt: 0 }).withMessage('價格必須是大於 0 的數字'),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('imageUrl').optional().isURL().withMessage('無效的圖片網址'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn(`更新菜品信息時數據驗證失敗: ${errors.array()[0].msg}`);
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }
    next();
  },
  dishController.updateDish
);

// 模擬熱門菜品數據的路由
router.get('/mock-popular', dishController.getMockPopularDishes);

module.exports = router;