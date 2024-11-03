// backend-project/controllers/deliveryPersonController.js

const User = require('../models/User'); // 使用统一的 User 模型
const Order = require('../models/Order'); // 引入订单模型
const bcrypt = require('bcryptjs'); // 使用 bcryptjs 进行密码哈希
const Joi = require('joi'); // 引入 Joi 进行数据验证
const ROLES = require('../constants/roles'); // 导入 ROLES 常量

/**
 * 通用分页参数处理
 * @param {Object} query - 请求的查询参数
 * @returns {Object} - 包含页码和限制数
 */
const getPagination = (query) => {
  let { page = 1, limit = 10 } = query;
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  return { page, limit };
};

/**
 * 获取外送员的个人资料
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const getDeliveryPersonProfile = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const deliveryPersonId = req.user.userId;
    const deliveryPerson = await User.findOne({ _id: deliveryPersonId, role: ROLES.DELIVERY_PERSON })
      .select('-password -__v'); // 排除密码和版本键

    if (!deliveryPerson) {
      console.warn(`外送员未找到，外送员 ID: ${deliveryPersonId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(404).json({ error: '外送员未找到' });
    }

    res.status(200).json(deliveryPerson);
    console.info(`外送员个人资料获取成功，外送员 ID: ${deliveryPersonId}`);
  } catch (error) {
    console.error('获取外送员个人资料失败:', error);
    next(error);
  }
};

/**
 * 获取所有外送员（仅限管理员）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const getAllDeliveryPersons = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { page, limit } = getPagination(req.query);

    const deliveryPersons = await User.find({ role: ROLES.DELIVERY_PERSON })
      .select('-password -__v')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments({ role: ROLES.DELIVERY_PERSON });

    res.status(200).json({ total, page, limit, deliveryPersons });
    console.info(`获取所有外送员成功，当前页数: ${page}, 返回数量: ${deliveryPersons.length}`);
  } catch (error) {
    console.error('获取所有外送员失败:', error);
    next(error);
  }
};

/**
 * 根据 ID 获取外送员
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const getDeliveryPersonById = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { personId } = req.params;

    // 数据验证
    const schema = Joi.object({
      personId: Joi.string().hex().length(24).required(),
    });

    const { error, value } = schema.validate({ personId });
    if (error) {
      console.warn(`数据验证失败: ${error.details[0].message}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(400).json({ error: error.details[0].message });
    }

    const deliveryPerson = await User.findOne({ _id: value.personId, role: ROLES.DELIVERY_PERSON })
      .select('-password -__v');

    if (!deliveryPerson) {
      console.warn(`外送员未找到，外送员 ID: ${personId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(404).json({ error: '外送员未找到' });
    }

    // 如果不是管理员，确保只能查看自己的信息
    if (req.user.role !== ROLES.ADMIN && req.user.userId !== personId) {
      console.warn(`用户无权查看外送员信息，外送员 ID: ${personId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(403).json({ error: '您没有权限查看此外送员信息' });
    }

    res.status(200).json(deliveryPerson);
    console.info(`获取外送员详细信息成功，外送员 ID: ${personId}`);
  } catch (error) {
    console.error('获取外送员详细信息失败:', error);
    next(error);
  }
};

/**
 * 更新外送员信息
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const updateDeliveryPerson = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { personId } = req.params;
    const { role, userId } = req.user;

    // 数据验证
    const schema = Joi.object({
      username: Joi.string().alphanum().min(3).max(50).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(), // E.164 格式
      vehicleType: Joi.string().valid('bike', 'car', 'scooter').optional(),
      password: Joi.string().min(6).optional(),
      availability: Joi.boolean().optional(),
      currentLocation: Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array().items(Joi.number().min(-180).max(180)).length(2).optional(),
      }).optional(),
      deliveryRadius: Joi.number().optional(),
      optimizedRoute: Joi.array().items(Joi.array().length(2)).optional(),
      totalDistance: Joi.number().optional(),
    }).min(1); // 至少需要一个字段

    const { error, value } = schema.validate(req.body);
    if (error) {
      console.warn(`数据验证失败: ${error.details[0].message}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(400).json({ error: error.details[0].message });
    }

    // 检查是否为管理员或外送员本人
    if (role !== ROLES.ADMIN && userId !== personId) {
      console.warn(`用户无权更新外送员信息，外送员 ID: ${personId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(403).json({ error: '您没有权限更新此外送员信息' });
    }

    // 允许的更新字段
    const allowedUpdates = ['username', 'email', 'phone', 'vehicleType', 'password', 'availability', 'currentLocation', 'deliveryRadius', 'optimizedRoute', 'totalDistance'];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (value[field] !== undefined) {
        updates[field] = value[field];
      }
    });

    // 如果有密码更新，需进行哈希
    if (updates.password) {
      const salt = await bcrypt.genSalt(12);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    // 更新外送员信息
    const updatedDeliveryPerson = await User.findOneAndUpdate(
      { _id: personId, role: ROLES.DELIVERY_PERSON },
      updates,
      { new: true, runValidators: true, context: 'query' }
    )
      .select('-password -__v');

    if (!updatedDeliveryPerson) {
      console.warn(`外送员未找到或更新失败，外送员 ID: ${personId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(404).json({ error: '外送员未找到或更新失败' });
    }

    // 发送 Socket.IO 事件
    req.app.locals.io.of('/orders').emit('deliveryPersonUpdated', { userId: updatedDeliveryPerson._id });

    res.status(200).json({ message: '外送员信息已更新', deliveryPerson: updatedDeliveryPerson });
    console.info(`外送员信息更新成功，外送员 ID: ${personId}`);
  } catch (error) {
    console.error('更新外送员信息失败:', error);
    next(error);
  }
};

/**
 * 禁用外送员
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const disableDeliveryPerson = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { personId } = req.params;
    const { role } = req.user;

    // 检查用户是否为管理员
    if (role !== ROLES.ADMIN) {
      console.warn(`非管理员尝试禁用外送员，外送员 ID: ${personId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(403).json({ error: '您没有权限禁用外送员' });
    }

    // 更新外送员的 availability 为 false
    const deliveryPerson = await User.findOneAndUpdate(
      { _id: personId, role: ROLES.DELIVERY_PERSON },
      { availability: false },
      { new: true }
    )
      .select('-password -__v');

    if (!deliveryPerson) {
      console.warn(`外送员未找到，外送员 ID: ${personId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(404).json({ error: '外送员未找到' });
    }

    // 发送 Socket.IO 事件
    req.app.locals.io.of('/orders').emit('deliveryPersonDisabled', { userId: deliveryPerson._id });

    res.status(200).json({ message: '外送员已禁用' });
    console.info(`外送员已禁用，外送员 ID: ${personId}`);
  } catch (error) {
    console.error('禁用外送员失败:', error);
    next(error);
  }
};

/**
 * 启用外送员
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const enableDeliveryPerson = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { personId } = req.params;
    const { role } = req.user;

    // 检查用户是否为管理员
    if (role !== ROLES.ADMIN) {
      console.warn(`非管理员尝试启用外送员，外送员 ID: ${personId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(403).json({ error: '您没有权限启用外送员' });
    }

    // 更新外送员的 availability 为 true
    const deliveryPerson = await User.findOneAndUpdate(
      { _id: personId, role: ROLES.DELIVERY_PERSON },
      { availability: true },
      { new: true }
    )
      .select('-password -__v');

    if (!deliveryPerson) {
      console.warn(`外送员未找到，外送员 ID: ${personId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(404).json({ error: '外送员未找到' });
    }

    // 发送 Socket.IO 事件
    req.app.locals.io.of('/orders').emit('deliveryPersonEnabled', { userId: deliveryPerson._id });

    res.status(200).json({ message: '外送员已启用' });
    console.info(`外送员已启用，外送员 ID: ${personId}`);
  } catch (error) {
    console.error('启用外送员失败:', error);
    next(error);
  }
};

/**
 * 获取所有外送员的位置（仅限管理员）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const getAllDeliveryPersonsLocations = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { page, limit } = getPagination(req.query);

    const locations = await User.find({ role: ROLES.DELIVERY_PERSON })
      .select('username currentLocation -_id')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments({ role: ROLES.DELIVERY_PERSON });

    res.status(200).json({ total, page, limit, locations });
    console.info(`获取所有外送员位置成功，当前页数: ${page}, 返回数量: ${locations.length}`);
  } catch (error) {
    console.error('获取所有外送员位置失败:', error);
    next(error);
  }
};

/**
 * 获取外送员的位置（仅限管理员或外送员本人）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const getDeliveryPersonLocation = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { personId } = req.params;
    const { role, userId } = req.user;

    // 定义验证 schema
    const schema = Joi.object({
      personId: Joi.string().hex().length(24).required(),
    });

    const { error, value } = schema.validate({ personId });
    if (error) {
      console.warn(`数据验证失败: ${error.details[0].message}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(400).json({ error: error.details[0].message });
    }

    // 检查是否为管理员或外送员本人
    if (role !== ROLES.ADMIN && userId !== personId) {
      console.warn(`用户无权查看外送员位置，外送员 ID: ${personId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(403).json({ error: '您没有权限查看外送员的位置' });
    }

    const deliveryPerson = await User.findOne({ _id: value.personId, role: ROLES.DELIVERY_PERSON })
      .select('currentLocation -_id');

    if (!deliveryPerson) {
      console.warn(`外送员未找到，外送员 ID: ${personId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(404).json({ error: '外送员未找到' });
    }

    res.status(200).json(deliveryPerson.currentLocation);
    console.info(`获取外送员位置成功，外送员 ID: ${personId}`);
  } catch (error) {
    console.error('获取外送员位置失败:', error);
    next(error);
  }
};

/**
 * 获取外送员的订单历史（仅限外送员本人或管理员）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const getOrderHistory = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { userId, role } = req.user;
    const { page, limit } = getPagination(req.query);

    let orders;
    let total;

    if (role === ROLES.ADMIN) {
      // 管理员可以查看所有订单
      orders = await Order.find()
        .populate('deliveryPerson', 'username email -_id')
        .populate('restaurant', 'name address -_id')
        .populate('user', 'username email -_id')
        .skip((page - 1) * limit)
        .limit(limit);
      total = await Order.countDocuments();
    } else if (role === ROLES.DELIVERY_PERSON) {
      // 外送员只能查看自己的订单
      orders = await Order.find({ deliveryPerson: userId })
        .populate('restaurant', 'name address -_id')
        .populate('user', 'username email -_id')
        .skip((page - 1) * limit)
        .limit(limit);
      total = await Order.countDocuments({ deliveryPerson: userId });
    } else {
      console.warn(`用户无权查看订单历史，角色: ${role}, 用户 ID: ${userId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(403).json({ error: '您没有权限查看订单历史' });
    }

    res.status(200).json({ total, page, limit, orders });
    console.info(`获取订单历史成功，角色: ${role}, 用户 ID: ${userId}`);
  } catch (error) {
    console.error('获取订单历史失败:', error);
    next(error);
  }
};

/**
 * 获取当前订单
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const getCurrentOrders = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { userId, role } = req.user;
    const { page, limit } = getPagination(req.query);

    let orders;
    let total;

    if (role === ROLES.ADMIN) {
      // 管理员可以查看所有当前订单
      orders = await Order.find({ status: { $nin: ['completed', 'cancelled'] } })
        .populate('deliveryPerson', 'username email -_id')
        .populate('restaurant', 'name address -_id')
        .populate('user', 'username email -_id')
        .skip((page - 1) * limit)
        .limit(limit);
      total = await Order.countDocuments({ status: { $nin: ['completed', 'cancelled'] } });
    } else if (role === ROLES.DELIVERY_PERSON) {
      // 外送员只能查看自己的当前订单
      orders = await Order.find({
        deliveryPerson: userId,
        status: { $nin: ['completed', 'cancelled'] },
      })
        .populate('restaurant', 'name address -_id')
        .populate('user', 'username email -_id')
        .skip((page - 1) * limit)
        .limit(limit);
      total = await Order.countDocuments({
        deliveryPerson: userId,
        status: { $nin: ['completed', 'cancelled'] },
      });
    } else {
      console.warn(`用户无权查看当前订单，角色: ${role}, 用户 ID: ${userId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(403).json({ error: '您没有权限查看当前订单' });
    }

    res.status(200).json({ total, page, limit, orders });
    console.info(`获取当前订单成功，角色: ${role}, 用户 ID: ${userId}`);
  } catch (error) {
    console.error('获取当前订单失败:', error);
    next(error);
  }
};

/**
 * 获取在线状态
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const getStatus = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { userId, role } = req.user;
    const { personId } = req.query;

    // 定义验证 schema
    const schema = Joi.object({
      personId: Joi.string().hex().length(24).optional(),
    });

    const { error, value } = schema.validate({ personId });
    if (error) {
      console.warn(`数据验证失败: ${error.details[0].message}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(400).json({ error: error.details[0].message });
    }

    const { personId: validatedPersonId } = value;

    let deliveryPerson;

    if (role === ROLES.ADMIN) {
      if (!validatedPersonId) {
        console.warn('管理员请求缺少 personId');
        console.log("Exiting controllers\\deliveryPersonController.js with status code");
        console.log("Exiting controllers\\deliveryPersonController.js with status code");
        console.log("Exiting controllers\\deliveryPersonController.js with status code");
        console.log("Exiting controllers\\deliveryPersonController.js with status code");
        return res.status(400).json({ error: '管理员请求必须包含 personId' });
      }
      deliveryPerson = await User.findOne({ _id: validatedPersonId, role: ROLES.DELIVERY_PERSON })
        .select('status -_id');
    } else if (role === ROLES.DELIVERY_PERSON) {
      deliveryPerson = await User.findOne({ _id: userId, role: ROLES.DELIVERY_PERSON })
        .select('status -_id');
    } else {
      console.warn(`用户无权查看在线状态，角色: ${role}, 用户 ID: ${userId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(403).json({ error: '您没有权限查看在线状态' });
    }

    if (!deliveryPerson) {
      console.warn(`外送员未找到，外送员 ID: ${role === ROLES.ADMIN ? validatedPersonId : userId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(404).json({ error: '外送员未找到' });
    }

    res.status(200).json({ status: deliveryPerson.status });
    console.info(`获取在线状态成功，外送员 ID: ${role === ROLES.ADMIN ? validatedPersonId : userId}, 状态: ${deliveryPerson.status}`);
  } catch (error) {
    console.error('获取在线状态失败:', error);
    next(error);
  }
};

/**
 * 更新在线状态
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const updateStatus = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { userId, role } = req.user;
    const { status, personId } = req.body;

    // 数据验证
    const schema = Joi.object({
      status: Joi.string().valid('available', 'busy', 'offline').required(),
      personId: Joi.string().hex().length(24).optional(),
    });

    const { error, value } = schema.validate({ status, personId });
    if (error) {
      console.warn(`数据验证失败: ${error.details[0].message}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(400).json({ error: error.details[0].message });
    }

    const { status: newStatus, personId: validatedPersonId } = value;

    let deliveryPerson;

    if (role === ROLES.ADMIN) {
      if (!validatedPersonId) {
        console.warn('管理员更新请求缺少 personId');
        console.log("Exiting controllers\\deliveryPersonController.js with status code");
        console.log("Exiting controllers\\deliveryPersonController.js with status code");
        console.log("Exiting controllers\\deliveryPersonController.js with status code");
        console.log("Exiting controllers\\deliveryPersonController.js with status code");
        return res.status(400).json({ error: '管理员更新请求必须包含 personId' });
      }
      deliveryPerson = await User.findOne({ _id: validatedPersonId, role: ROLES.DELIVERY_PERSON });
    } else if (role === ROLES.DELIVERY_PERSON) {
      deliveryPerson = await User.findOne({ _id: userId, role: ROLES.DELIVERY_PERSON });
    } else {
      console.warn(`用户无权更新在线状态，角色: ${role}, 用户 ID: ${userId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(403).json({ error: '您没有权限更新在线状态' });
    }

    if (!deliveryPerson) {
      console.warn(`外送员未找到，外送员 ID: ${role === ROLES.ADMIN ? validatedPersonId : userId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(404).json({ error: '外送员未找到' });
    }

    deliveryPerson.status = newStatus;
    await deliveryPerson.save();

    // 发送 Socket.IO 事件
    req.app.locals.io.of('/orders').emit('deliveryPersonStatusUpdate', { userId: deliveryPerson._id, status: deliveryPerson.status });

    res.status(200).json({ message: '在线状态更新成功', status: deliveryPerson.status });
    console.info(`在线状态更新成功，外送员 ID: ${deliveryPerson._id}, 状态: ${deliveryPerson.status}`);
  } catch (error) {
    console.error('更新在线状态失败:', error);
    next(error);
  }
};

/**
 * 获取所有待处理订单（仅限外送员和管理员）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const getPendingOrders = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { role, userId } = req.user;
    const { page, limit } = getPagination(req.query);

    // 检查用户是否有权限
    if (![ROLES.ADMIN, ROLES.DELIVERY_PERSON].includes(role)) {
      console.warn(`用户无权获取待处理订单，角色: ${role}, 用户 ID: ${userId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(403).json({ error: '您没有权限查看待处理订单' });
    }

    let filter = { status: 'pending' };
    if (role === ROLES.DELIVERY_PERSON) {
      filter.deliveryPerson = userId;
    }

    const pendingOrders = await Order.find(filter)
      .populate('restaurant', 'name address -_id')
      .populate('user', 'username email -_id')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.status(200).json({ total, page, limit, orders: pendingOrders });
    console.info(`获取待处理订单成功，当前页数: ${page}, 返回数量: ${pendingOrders.length}`);
  } catch (error) {
    console.error('获取待处理订单失败:', error);
    next(error);
  }
};

/**
 * 外送员接受订单
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const acceptOrder = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const { orderId } = req.params;
    const deliveryPersonId = req.user.userId;

    // 验证 orderId
    const schema = Joi.object({
      orderId: Joi.string().hex().length(24).required(),
    });

    const { error, value } = schema.validate({ orderId });
    if (error) {
      console.warn(`订单 ID 验证失败: ${error.details[0].message}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(400).json({ error: error.details[0].message });
    }

    // 查找订单，确保其状态为 pending
    const order = await Order.findOne({ _id: value.orderId, status: 'pending' });
    if (!order) {
      console.warn(`订单未找到或已被接受，订单 ID: ${orderId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(404).json({ error: '订单未找到或已被接受' });
    }

    // 更新订单状态为 accepted，并分配给当前外送员
    order.status = 'accepted';
    order.deliveryPerson = deliveryPersonId;
    await order.save();

    // 发送 Socket.IO 事件
    req.app.locals.io.of('/orders').emit('orderAccepted', { orderId: order._id, deliveryPersonId });

    res.status(200).json({ message: '订单已接受', order });
    console.info(`订单已被接受，订单 ID: ${orderId}, 外送员 ID: ${deliveryPersonId}`);
  } catch (error) {
    console.error('接受订单失败:', error);
    next(error);
  }
};

/**
 * 获取外送员收益数据
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const getEarnings = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const deliveryPersonId = req.user.userId;

    // 获取已完成的订单
    const completedOrders = await Order.find({ deliveryPerson: deliveryPersonId, status: 'completed' })
      .select('deliveryFee -_id');

    // 计算总收益
    const totalEarnings = completedOrders.reduce((total, order) => total + (order.deliveryFee || 0), 0);

    res.status(200).json({ totalEarnings, completedOrdersCount: completedOrders.length });
    console.info(`获取收益数据成功，外送员 ID: ${deliveryPersonId}`);
  } catch (error) {
    console.error('获取收益数据失败:', error);
    next(error);
  }
};

/**
 * 更新外送员位置
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 */
const updateLocation = async (req, res, next) => {
  try {
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    console.log("Entering controllers\\deliveryPersonController.js");
    const userId = req.user.userId;

    // 数据验证
    const schema = Joi.object({
      currentLocation: Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array()
          .items(Joi.number().min(-180).max(180)) // 经度范围验证
          .length(2)
          .required(),
      }).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      console.warn(`数据验证失败: ${error.details[0].message}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, role: ROLES.DELIVERY_PERSON },
      { currentLocation: value.currentLocation },
      { new: true, runValidators: true, context: 'query' }
    )
      .select('-password -__v');

    if (!updatedUser) {
      console.warn(`外送员未找到，外送员 ID: ${userId}`);
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      console.log("Exiting controllers\\deliveryPersonController.js with status code");
      return res.status(404).json({ error: '外送员未找到' });
    }

    res.status(200).json({ message: '位置更新成功', currentLocation: updatedUser.currentLocation });
    console.info(`位置更新成功，外送员 ID: ${userId}`);
  } catch (error) {
    console.error('更新位置失败:', error);
    next(error);
  }
};

/**
 * 导出所有控制器函数
 */
module.exports = {
  getDeliveryPersonProfile,
  getAllDeliveryPersons,
  getDeliveryPersonById,
  updateDeliveryPerson,
  disableDeliveryPerson,
  enableDeliveryPerson,
  getAllDeliveryPersonsLocations,
  getDeliveryPersonLocation,
  getOrderHistory,
  getCurrentOrders,
  getStatus,
  updateStatus,
  getPendingOrders,
  acceptOrder,
  getEarnings,
  updateLocation, // 确保添加了 updateLocation
};