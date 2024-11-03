// models/Feedback.js

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  rating: {
    type: Number,
    min: [1, '评分不能低于 1'],
    max: [5, '评分不能高于 5'],
    required: true,
    validate: {
      validator: Number.isInteger,
      message: '评分必须是整数',
    },
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, '评论不能超过 1000 个字符'],
  },
  response: {
    type: String,
    trim: true,
    maxlength: [1000, '回复不能超过 1000 个字符'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// 索引
feedbackSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });
feedbackSchema.index({ restaurantId: 1 });
feedbackSchema.index({ rating: 1 });

// 静态方法：计算餐厅的平均评分
feedbackSchema.statics.calculateAverageRating = async function(restaurantId) {
  const result = await this.aggregate([
    { $match: { restaurantId } },
    { $group: { _id: '$restaurantId', avgRating: { $avg: '$rating' } } },
  ]);
  return result.length > 0 ? result[0].avgRating : null;
};

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;