// models/Dish.js
const mongoose = require('mongoose');

// 菜品 Schema
const dishSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true 
  },
  imageUrl: { 
    type: String 
  },  // 菜品图片
}, { timestamps: true });

// 创建并导出 Dish 模型
const Dish = mongoose.model('Dish', dishSchema);
module.exports = Dish;
