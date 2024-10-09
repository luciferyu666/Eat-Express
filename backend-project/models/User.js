const mongoose = require('mongoose');

// 定義地址 schema
const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,  // 地址標籤必須存在
  },
  address: {
    type: String,
    required: true,  // 地址詳細信息必須存在
  },
});

// 定義用戶 schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,  // 用戶名必須存在
    unique: true,    // 保證唯一
  },
  email: {
    type: String,
    required: true,  // 電子郵件必須存在
    unique: true,    // 保證唯一
  },
  password: {
    type: String,
    required: true,  // 密碼必須存在
  },
  addresses: [addressSchema],  // 使用 addressSchema 定義多個地址
  role: {
    type: String,
    enum: ['customer', 'restaurant', 'delivery_person', 'admin'],  // 確保 delivery_person 包含在這裡
    default: 'customer',  // 預設角色為 "customer"
  },
  orderHistory: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },  // 訂單ID參照
      status: String,  // 訂單狀態
      totalPrice: Number,  // 總價
    },
  ],
}, { timestamps: true });  // 自動管理創建和更新時間

// 創建並導出 User 模型
const User = mongoose.model('User', userSchema);
module.exports = User;
