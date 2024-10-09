// models/Restaurant.js

const mongoose = require('mongoose');

// 餐廳 Schema
const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  status: {
    type: String,
    default: 'active',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    }, // 地理類型為 GeoJSON 的 "Point"
    coordinates: {
      type: [Number],
      required: true,
    }, // 經度、緯度
  },
  menu: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
    },
  ], // 參照 Dish 模型，表示餐廳的菜單
});

// 設置地理位置索引，確保可以進行地理位置篩選
restaurantSchema.index({ location: '2dsphere' });

// 創建並導出 Restaurant 模型
const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;