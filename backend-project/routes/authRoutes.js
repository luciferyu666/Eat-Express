// backend-project/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 顧客註冊路由
router.post('/register', authController.registerCustomer);

// 餐廳註冊路由
router.post('/restaurant-register', authController.registerRestaurant);

// 外送員註冊路由
router.post('/delivery-register', authController.registerDeliveryPerson);

// 管理員註冊路由
router.post('/admin/register', authController.registerAdmin);

// 通用登入路由（顧客、餐廳、外送員）
router.post('/login', authController.login);

// 管理員登入路由
router.post('/admin/login', authController.loginAdmin);

// 登出路由（適用於所有角色）
router.post('/logout', authController.verifyToken, authController.logout);

// 受保護的測試路由
router.get('/protected', authController.verifyToken, (req, res) => {
  res.json({ message: '你已經成功訪問到受保護的路由' });
});

module.exports = router;
