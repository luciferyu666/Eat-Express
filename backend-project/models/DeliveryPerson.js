// models/DeliveryPerson.js
const mongoose = require('mongoose');

const deliveryPersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'car', 'scooter'], // 外送員可選擇的交通工具
    required: true,
  },
  password: { // 新增密碼字段
    type: String,
    required: true,
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [經度, 緯度]
      required: false,
    },
  },
  availability: {
    type: Boolean,
    default: true, // 是否可用來接單
  },
}, { timestamps: true });

// 創建地理空間索引
deliveryPersonSchema.index({ currentLocation: '2dsphere' });

const DeliveryPerson = mongoose.models.DeliveryPerson || mongoose.model('DeliveryPerson', deliveryPersonSchema);

module.exports = DeliveryPerson;