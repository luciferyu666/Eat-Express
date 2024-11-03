// models/Order.js

const mongoose = require('mongoose');

const { Schema } = mongoose;

// 定义订单模式
const OrderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '订单必须关联一个客户'],
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, '订单必须关联一个餐厅'],
    },
    items: [
      {
        dish: {
          type: Schema.Types.ObjectId,
          ref: 'Dish',
          required: [true, '订单项必须关联一个菜品'],
        },
        quantity: {
          type: Number,
          required: [true, '订单项必须有数量'],
          min: [1, '数量不能少于1'],
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: [true, '订单必须有总价'],
      min: [0, '总价不能为负数'],
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'online_payment'],
      required: [true, '支付方式是必填项'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'ready', 'assigned', 'delivering', 'completed', 'cancelled'],
      default: 'pending',
      required: [true, '订单状态是必填项'],
    },
    deliveryAddress: {
      type: String,
      required: [true, '配送地址是必填项'],
    },
    customerLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: [true, '客户位置类型是必填项'],
      },
      coordinates: {
        type: [Number],
        required: [true, '客户坐标是必填项'],
        validate: {
          validator: function (value) {
            return value.length === 2;
          },
          message: '客户坐标必须是包含经度和纬度的数组',
        },
        validate: [
          {
            validator: function (value) {
              const [lng, lat] = value;
              return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
            },
            message: '经度必须在 -180 和 180 之间，纬度必须在 -90 和 90 之间。',
          },
        ],
      },
    },
    restaurantAddress: {
      type: String,
      required: [true, '餐厅地址是必填项'],
    },
    deliveryPerson: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return ['assigned', 'delivering', 'completed'].includes(this.status);
      },
    },
    deliveryLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: function () {
          return ['assigned', 'delivering', 'completed'].includes(this.status);
        },
      },
      coordinates: {
        type: [Number],
        required: function () {
          return ['assigned', 'delivering', 'completed'].includes(this.status);
        },
        validate: {
          validator: function (value) {
            return value.length === 2;
          },
          message: '配送坐标必须是包含经度和纬度的数组',
        },
        validate: [
          {
            validator: function (value) {
              const [lng, lat] = value;
              return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
            },
            message: '经度必须在 -180 和 180 之间，纬度必须在 -90 和 90 之间。',
          },
        ],
      },
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// 索引设置，以提高查询性能
OrderSchema.index({ customer: 1 });
OrderSchema.index({ restaurant: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ deliveryPerson: 1 });
OrderSchema.index({ customerLocation: '2dsphere' });
OrderSchema.index({ deliveryLocation: '2dsphere' });

// 预保存钩子：在保存订单之前计算总价
OrderSchema.pre('save', async function (next) {
  if (this.isModified('items') || this.isNew) {
    try {
      console.log("Entering models\\Order.js");
      console.log("Entering models\\Order.js");
      console.log("Entering models\\Order.js");
      console.log("Entering models\\Order.js");
      // 填充菜品信息以获取价格
      await this.populate('items.dish');
      this.totalPrice = this.items.reduce((total, item) => {
        console.log("Exiting models\\Order.js with status code");
        console.log("Exiting models\\Order.js with status code");
        console.log("Exiting models\\Order.js with status code");
        console.log("Exiting models\\Order.js with status code");
        return total + item.dish.price * item.quantity;
      }, 0);
      next();
    } catch (error) {
      console.error(`计算订单总价时出错: ${error.message}`);
      next(error);
    }
  } else {
    next();
  }
});

// 导出订单模型
module.exports = mongoose.model('Order', OrderSchema);
