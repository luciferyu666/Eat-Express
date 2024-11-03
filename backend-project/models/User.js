// backend-project/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ROLES = require('../constants/roles'); // 导入 ROLES 常量

const { Schema } = mongoose;

// 定义 GeoJSON Schema，用于地理位置字段
const GeoSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      validate: [
        {
          validator: function (value) {
            return value.length === 2;
          },
          message: '坐标必须包含经度和纬度。',
        },
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
  { _id: false }
);

// 定义用户模式
const UserSchema = new Schema(
  {
    // 通用字段
    name: {
      type: String,
      required: function () {
        return [ROLES.DELIVERY_PERSON, ROLES.CUSTOMER, ROLES.RESTAURANT_OWNER].includes(this.role);
      },
      trim: true,
      minlength: [3, '姓名必须至少包含 3 个字符'],
      maxlength: [50, '姓名不能超过 50 个字符'],
    },
    email: {
      type: String,
      required: [true, '电子邮件是必填项'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, '请输入有效的电子邮件地址'],
    },
    password: {
      type: String,
      required: [true, '密码是必填项'],
      minlength: [6, '密码必须至少包含 6 个字符'],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, '用户角色是必填项'],
      default: ROLES.CUSTOMER,
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // 允许多个 null 值
      minlength: [3, '用户名必须至少包含 3 个字符'],
      maxlength: [30, '用户名不能超过 30 个字符'],
      match: [/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和连字符'],
      required: function () {
        return [ROLES.DELIVERY_PERSON, ROLES.RESTAURANT_OWNER].includes(this.role);
      },
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      required: function () {
        return [ROLES.DELIVERY_PERSON, ROLES.CUSTOMER, ROLES.RESTAURANT_OWNER].includes(this.role);
      },
      match: [/^\+?[1-9]\d{1,14}$/, '请输入有效的电话号码（E.164 格式）。'], // E.164 格式
    },
    // 配送员特定字段
    availability: {
      type: Boolean,
      default: true,
    },
    currentOrderCount: {
      type: Number,
      default: 0,
    },
    currentOrders: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
      default: [],
    },
    currentLocation: {
      type: GeoSchema,
      required: function () {
        return this.role === ROLES.DELIVERY_PERSON;
      },
    },
    vehicleType: {
      type: String,
      enum: ['bike', 'motorbike', 'car', 'scooter'],
      required: function () {
        return this.role === ROLES.DELIVERY_PERSON;
      },
    },
    status: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'offline',
      required: function () {
        return this.role === ROLES.DELIVERY_PERSON;
      },
    },
    deliveryRadius: {
      type: Number, // 单位：公里
      min: [1, '配送半径必须至少为 1 公里'],
      max: [100, '配送半径不能超过 100 公里'],
      required: function () {
        return this.role === ROLES.DELIVERY_PERSON;
      },
    },
    optimizedRoute: {
      type: [[[Number]]], // 三维数组，表示多个坐标点的集合
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value);
        },
        message: '优化路线必须是坐标点的数组。',
      },
    },
    totalDistance: {
      type: Number, // 单位：公里
      min: [0, '总配送距离不能为负数'],
      default: 0,
    },
    // 餐厅老板特定字段
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// 密码哈希中间件
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    console.log("Entering models\\User.js");
    console.log("Entering models\\User.js");
    console.log("Entering models\\User.js");
    console.log("Entering models\\User.js");
    const SALT_ROUNDS = 12; // 或者从配置中获取
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.error(`[UserModel] 哈希密码时出错，用户 ${this.email}:`, err);
    next(err);
  }
});

// 密码比较方法
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("Entering models\\User.js");
    console.log("Entering models\\User.js");
    console.log("Entering models\\User.js");
    console.log("Entering models\\User.js");
    console.log("Exiting models\\User.js with status code");
    console.log("Exiting models\\User.js with status code");
    console.log("Exiting models\\User.js with status code");
    console.log("Exiting models\\User.js with status code");
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    console.error(`[UserModel] 比较密码时出错，用户 ${this.email}:`, err);
    throw err;
  }
};

// 索引
UserSchema.index({ email: 1 }, { unique: true, name: 'email_unique_idx' });
UserSchema.index({ username: 1 }, { unique: true, sparse: true, name: 'username_unique_idx' });
UserSchema.index({ name: 1 }, { name: 'name_idx' });
UserSchema.index(
  { currentLocation: '2dsphere' },
  { partialFilterExpression: { role: ROLES.DELIVERY_PERSON }, name: 'currentLocation_2dsphere_idx' }
);
UserSchema.index({ role: 1 }, { name: 'role_idx' });

// 导出用户模型
module.exports = mongoose.model('User', UserSchema);
