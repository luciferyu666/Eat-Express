const Notification = require('../models/Notification');
const firebaseAdmin = require('firebase-admin');

// 發送通知（可以是 WebSocket 或 FCM）
const sendNotification = async (recipient, message, orderId, type) => {
  // 保存通知到資料庫
  const notification = new Notification({
    recipient,
    message,
    orderId,
    type,
    timestamp: new Date(),
  });
  await notification.save();

  // 發送 FCM 推送通知
  const payload = {
    notification: {
      title: '訂單通知',
      body: message,
    },
    data: {
      orderId: orderId ? orderId.toString() : '',
      type,
    },
  };

  // 假設有 FCM token
  const userToken = await getUserToken(recipient);
  if (userToken) {
    await firebaseAdmin.messaging().sendToDevice(userToken, payload);
  }

  // 如果 WebSocket，也可以通過 WebSocket 方式推送
  // req.io.emit('notification', { recipient, message, orderId, type });
};

// 獲取用戶的 FCM token
const getUserToken = async (userId) => {
  // 假設從資料庫獲取用戶的 token
  const user = await User.findById(userId);
  return user.fcmToken;
};

// 查詢通知歷史
const getNotificationHistory = async (recipient) => {
  return await Notification.find({ recipient }).sort({ timestamp: -1 });
};

module.exports = { sendNotification, getNotificationHistory };
