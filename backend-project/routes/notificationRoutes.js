// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { sendNotification, getNotificationHistory } = require('../services/notificationService');

// 發送通知
router.post('/send', async (req, res) => {
  const { recipient, message, orderId, type } = req.body;
  try {
    await sendNotification(recipient, message, orderId, type);
    res.json({ status: 'success', message: '通知已發送' });
  } catch (error) {
    console.error('發送通知失敗:', error);
    res.status(500).json({ status: 'error', message: '無法發送通知' });
  }
});

// 查看通知歷史
router.get('/history', async (req, res) => {
  const { recipient } = req.query;
  try {
    const history = await getNotificationHistory(recipient);
    res.json({ status: 'success', data: history });
  } catch (error) {
    console.error('獲取通知歷史失敗:', error);
    res.status(500).json({ status: 'error', message: '無法獲取通知歷史' });
  }
});

module.exports = router;
