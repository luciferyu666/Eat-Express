// backend-project/models/Employee.js
const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, '姓名至少需要 2 个字符'],
      maxlength: [50, '姓名不能超过 50 个字符'],
    },
    role: {
      type: String,
      required: true,
      enum: ['manager', 'chef', 'waiter', 'host', 'cashier', 'dishwasher', 'staff', 'other'], // 添加 'staff'
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, '请输入有效的电子邮箱地址'],
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      match: [/^\+?[0-9\-]{7,15}$/, '请输入有效的电话号码'],
      unique: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'terminated'],
      default: 'active',
    },
    salary: {
      type: Number,
      min: [0, '薪资不能为负数'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 索引
EmployeeSchema.index({ restaurant: 1 });
EmployeeSchema.index({ role: 1 });
EmployeeSchema.index({ email: 1 }, { unique: true });
EmployeeSchema.index({ phone: 1 }, { unique: true });

// 实例方法：更新员工状态
EmployeeSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// 静态方法：查找餐厅的所有员工
EmployeeSchema.statics.findByRestaurant = function(restaurantId) {
  return this.find({ restaurant: restaurantId, isDeleted: false });
};

module.exports = mongoose.model('Employee', EmployeeSchema);