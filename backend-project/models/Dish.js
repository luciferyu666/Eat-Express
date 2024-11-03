// backend-project/models/Dish.js
const mongoose = require('mongoose');

// 菜品 Schema
const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, '菜品名称不能为空'],
    maxlength: [100, '菜品名称不能超过 100 个字符'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '描述不能超过 500 个字符'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, '价格不能为负数'],
    validate: {
      validator: function(value) {
        const multiplied = value * 100;
        const epsilon = 1e-6; // 定义一个小的容差值
        const isValid = Math.abs(Math.round(multiplied) - multiplied) < epsilon;
        if (!isValid) {
          console.log(`Invalid price: ${value}, multiplied: ${multiplied}`);
        }
        return isValid;
      },
      message: '价格最多只能有两位小数',
    },
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/.test(v);
      },
      message: '请输入有效的 URL',
    },
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  category: {
    type: String,
    enum: ['开胃菜', '主菜', '甜点', '饮料'], // 使用中文枚举值
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  tags: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// 索引
dishSchema.index({ name: 1 });
dishSchema.index({ price: 1 });
dishSchema.index({ restaurant: 1 });
dishSchema.index({ category: 1 });

// 虚拟字段：折扣价（示例）
dishSchema.virtual('discountPrice').get(function() {
  if (this.discount && this.discount > 0) {
    return this.price * (1 - this.discount);
  }
  return this.price;
});

// 静态方法：根据价格范围查找菜品
dishSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  return this.find({
    price: { $gte: minPrice, $lte: maxPrice },
  });
};

// 创建并导出 Dish 模型
const Dish = mongoose.model('Dish', dishSchema);
module.exports = Dish;