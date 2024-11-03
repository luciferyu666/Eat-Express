// models/Notification.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'recipientType' // 动态引用，根据 recipientType 字段确定引用的模型
  },
  recipientType: { 
    type: String, 
    required: true, 
    enum: ['User', 'Restaurant', 'DeliveryPerson']
  },
  message: { 
    type: String, 
    required: true,
    maxlength: [500, '通知内容不能超过 500 个字符']
  },
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order',
    required: function() {
      return this.type === 'order_update';
    }
  },
  type: { 
    type: String, 
    enum: ['order_update', 'promotion', 'other'], 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
notificationSchema.index({ recipient: 1, recipientType: 1 });
notificationSchema.index({ isRead: 1 });

// 实例方法：标记为已读
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// 静态方法：获取未读通知
notificationSchema.statics.getUnreadNotifications = function(recipientId, recipientType) {
  return this.find({ recipient: recipientId, recipientType, isRead: false });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;