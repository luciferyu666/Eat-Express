// models/Restaurant.js

const mongoose = require('mongoose');

// 餐厅 Schema
const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, '餐厅名称至少需要 3 个字符'],
    maxlength: [100, '餐厅名称不能超过 100 个字符'],
  },
  address: {
    type: String,
    required: true,
    trim: true,
    minlength: [5, '地址至少需要 5 个字符'],
    maxlength: [200, '地址不能超过 200 个字符'],
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /\+?[0-9\-]{7,15}/.test(v);
      },
      message: props => `${props.value} 不是有效的电话号码！`,
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    }, // 地理类型为 GeoJSON 的 "Point"
    coordinates: {
      type: [Number],
      required: true,
      validate: [
        {
          validator: function(value) {
            return value.length === 2;
          },
          message: '坐标必须包含经度和纬度。',
        },
        {
          validator: function(value) {
            const [lng, lat] = value;
            return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
          },
          message: '经度必须在 -180 到 180 之间，纬度必须在 -90 到 90 之间。',
        },
      ],
    },
  },
  menu: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
      },
    ],
    default: [],
  },
  openingHours: {
    type: String,
  },
  categories: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// 索引
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ name: 1 });
restaurantSchema.index({ address: 1 });
restaurantSchema.index({ status: 1 });

// 静态方法：查找附近的餐厅
restaurantSchema.statics.findNearby = function(coordinates, maxDistance) {
  return this.find({
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
  });
};

// 创建并导出 Restaurant 模型
const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;