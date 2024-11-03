// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')('your-stripe-secret-key');  // Stripe 秘鑰
const verifyToken = require('../middleware/verifyToken');  // 引入統一的 JWT 驗證中間件
const Payment = require('../models/Payment');  // 引入 Payment 模型

// Stripe 支付請求 API（需要身份驗證）
router.post('/stripe', verifyToken, async (req, res) => {
  console.log('处理 POST /stripe 请求');
  const { amount, currency, source, description } = req.body;

  try {
    console.log("Entering routes\\paymentRoutes.js");
    console.log("Entering routes\\paymentRoutes.js");
    console.log("Entering routes\\paymentRoutes.js");
    console.log("Entering routes\\paymentRoutes.js");
    // 創建 Stripe 支付意圖
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,  // Stripe 以 "分" 為單位，需要轉換
      currency,
      payment_method: source,  // Stripe 的付款方法（如信用卡 token）
      description,
      confirm: true,  // 立即確認支付
    });

    // 成功處理支付
    res.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (error) {
    // 支付失敗
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, message: 'Payment failed', error: error.message });
  }
});

// 查詢支付狀態 API（需要身份驗證）
router.get('/:orderId/status', verifyToken, async (req, res) => {
  console.log('处理 GET /:orderId/status 请求');
  const { orderId } = req.params;

  try {
    console.log("Entering routes\\paymentRoutes.js");
    console.log("Entering routes\\paymentRoutes.js");
    console.log("Entering routes\\paymentRoutes.js");
    console.log("Entering routes\\paymentRoutes.js");
    // 假設我們可以根據訂單 ID 查詢支付狀態
    const paymentStatus = await Payment.findOne({ orderId });
    if (!paymentStatus) {
      console.log("Exiting routes\\paymentRoutes.js with status code");
      console.log("Exiting routes\\paymentRoutes.js with status code");
      console.log("Exiting routes\\paymentRoutes.js with status code");
      console.log("Exiting routes\\paymentRoutes.js with status code");
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, status: paymentStatus.status });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ success: false, message: 'Error fetching payment status' });
  }
});

module.exports = router;