// models/Order.js
const mongoose = require('mongoose');

// 定義訂單 schema
const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },  // 用戶參照
  
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant', 
    required: true 
  },  // 餐廳參照
  
  items: [{
    dish: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Dish',
      required: true 
    },  // 菜品參照
    quantity: { 
      type: Number, 
      required: true 
    },  // 數量
  }],
  
  deliveryAddress: { 
    type: String, 
    required: true 
  },  // 配送地址
  
  customerLat: { 
    type: Number, 
    required: true 
  },  // 顧客緯度
  
  customerLng: { 
    type: Number, 
    required: true 
  },  // 顧客經度
  
  restaurantAddress: { 
    type: String, 
    required: true 
  },  // 餐廳地址
  
  paymentMethod: { 
    type: String, 
    required: true 
  },  // 付款方式
  
  status: { 
    type: String, 
    default: 'waiting',
    enum: ['waiting', 'active', 'completed', 'cancelled']
  },  // 訂單狀態
  
  deliveryLocation: {  // 外送員實時位置
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number] 
    },
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  },  // 創建時間
});

// 創建並導出 Order 模型
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
