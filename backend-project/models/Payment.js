// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, '支付金额不能为负数'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value * 100); // 确保金额最多两位小数
      },
      message: '支付金额最多只能有两位小数',
    },
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'CNY'], // 根据您的业务需求添加货币类型
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// 索引
paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ status: 1 });

// 静态方法：根据订单 ID 查找支付记录
paymentSchema.statics.findByOrderId = function(orderId) {
  return this.findOne({ orderId });
};

// 实例方法：更新支付状态
paymentSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;