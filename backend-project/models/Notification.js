const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true }, // 可以是用戶或餐廳的ID
  message: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // 可選，與訂單關聯
  type: { type: String, enum: ['order_update', 'promotion', 'other'] }, // 通知類型
  timestamp: { type: Date, default: Date.now }, // 通知發送時間
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
