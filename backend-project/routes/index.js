const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
// const logRoutes = require('./logRoutes'); // 已刪除
const paymentRoutes = require('./paymentRoutes'); 

// 使用路由
router.use('/auth', authRoutes);
// router.use('/logs', logRoutes); // 已刪除
router.use('/payment', paymentRoutes); 

module.exports = router;
