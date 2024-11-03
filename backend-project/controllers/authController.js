// backend/controllers/authController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/authHelpers');
const User = require('../models/User');
const redisClient = require('../redisClient'); // 引入 Redis 客户端
const { JWT_SECRET } = require('../config'); // 引入 JWT_SECRET
const Joi = require('joi'); // 引入 Joi 进行数据验证
const ROLES = require('../constants/roles'); // 导入 ROLES 常量

// 确保 JWT_SECRET 存在
if (!JWT_SECRET) {
  console.error('缺少 JWT_SECRET，在配置中未找到');
  throw new Error('服务器配置错误：缺少 JWT_SECRET');
}

// 通用异步处理器
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// =======================
// 用户注册控制器
// =======================

/**
 * 通用注册控制器
 * @param {string} role - 用户角色
 */
const register = (role) => asyncHandler(async (req, res) => {
  let schema;
  let userData;

  if (role === ROLES.CUSTOMER) {
    schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      username: Joi.string().min(3).max(50).optional(),
    });
    userData = {
      email: req.body.email,
      password: req.body.password,
      role,
      username: req.body.username, // 可选字段
    };
  } else if (role === ROLES.RESTAURANT_OWNER) {
    schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      username: Joi.string().min(3).max(50).required(),
    });
    userData = {
      email: req.body.email,
      password: req.body.password,
      role,
      username: req.body.username,
    };
  } else if (role === ROLES.DELIVERY_PERSON) {
    schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      username: Joi.string().min(3).max(50).required(),
      name: Joi.string().min(1).max(100).required(),
      phone: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .required()
        .messages({
          'string.pattern.base': '请输入有效的电话号码（E.164 格式）。',
        }),
      vehicleType: Joi.string()
        .valid('bike', 'motorbike', 'car', 'scooter')
        .required()
        .messages({
          'any.only': '交通工具类型必须是 bike, motorbike, car 或 scooter。',
        }),
      deliveryRadius: Joi.number().min(1).max(100).required().messages({
        'number.base': '配送半径必须是数字。',
        'number.min': '配送半径至少为 1 公里。',
        'number.max': '配送半径最多为 100 公里。',
      }),
      currentLocation: Joi.object({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array()
          .items(Joi.number())
          .length(2)
          .required()
          .messages({
            'array.length': '坐标必须包含经度和纬度。',
            'number.base': '坐标必须是数字。',
          }),
      }).required(),
    });
    userData = {
      email: req.body.email,
      password: req.body.password,
      role,
      username: req.body.username,
      name: req.body.name,
      phone: req.body.phone,
      vehicleType: req.body.vehicleType,
      deliveryRadius: req.body.deliveryRadius,
      currentLocation: req.body.currentLocation,
      status: 'available', // 初始状态
      // 其他字段根据需要添加
    };
  } else if (role === ROLES.ADMIN) {
    schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      username: Joi.string().min(3).max(50).required(),
    });
    userData = {
      email: req.body.email,
      password: req.body.password,
      role,
      username: req.body.username,
    };
  } else {
    return res.status(400).json({ error: '无效的用户角色' });
  }

  // 数据验证
  const { error, value } = schema.validate(req.body);
  if (error) {
    console.warn(`${role}注册数据验证失败: ${error.details[0].message}`);
    return res.status(400).json({ error: error.details[0].message });
  }

  // 检查是否已有相同电子邮件或用户名的用户
  const existingUser = await User.findOne({
    $or: [{ email: value.email }, { username: value.username }],
    role,
  });
  if (existingUser) {
    console.warn(`${role}注册失败：电子邮件 ${value.email} 或用户名 ${value.username} 已被注册`);
    return res.status(400).json({ error: `该电子邮件或用户名已被注册为${role}` });
  }

  // 创建新用户（密码哈希由模型处理）
  const newUser = new User(userData);

  // 保存用户到数据库
  await newUser.save();

  // 生成 JWT Token
  const token = generateToken(newUser._id, role);
  console.info(`${role}注册成功：${value.email}, Token: ${token}`);

  // 生成刷新 Token
  const refreshToken = jwt.sign(
    { userId: newUser._id, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  await redisClient.set(refreshToken, newUser._id.toString(), { EX: 7 * 24 * 60 * 60 }); // 设置过期时间为 7 天

  res.status(201).json({ message: `${role}注册成功`, token, refreshToken });
});

// 顾客注册控制器
const registerCustomer = register(ROLES.CUSTOMER);

// 餐厅注册控制器
const registerRestaurant = register(ROLES.RESTAURANT_OWNER);

// 外送员注册控制器
const registerDeliveryPerson = register(ROLES.DELIVERY_PERSON);

// 管理员注册控制器
const registerAdmin = register(ROLES.ADMIN);

// =======================
// 用户登录控制器
// =======================

/**
 * 通用登录控制器（使用 email 和 password）
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 数据验证
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error, value } = schema.validate({ email, password });
  if (error) {
    console.warn(`用户登录数据验证失败: ${error.details[0].message}`);
    return res.status(400).json({ error: error.details[0].message });
  }

  const { email: validEmail, password: validPassword } = value;

  // 查找用户
  const userRecord = await User.findOne({ email: validEmail });
  if (!userRecord) {
    console.warn(`用户登录失败：电子邮件 ${validEmail} 不存在`);
    return res.status(400).json({ message: '用户不存在' });
  }

  // 验证密码
  const isMatch = await userRecord.comparePassword(validPassword);
  if (!isMatch) {
    console.warn(`用户登录失败：电子邮件 ${validEmail} 密码不正确`);
    return res.status(400).json({ message: '密码不正确' });
  }

  // 生成 JWT Token
  const token = generateToken(userRecord._id, userRecord.role);
  console.info(`用户登录成功：${validEmail}, Token: ${token}`);

  // 生成刷新 Token
  const refreshToken = jwt.sign(
    { userId: userRecord._id, role: userRecord.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  await redisClient.set(refreshToken, userRecord._id.toString(), { EX: 7 * 24 * 60 * 60 }); // 设置过期时间为 7 天

  res.status(200).json({ token, role: userRecord.role, refreshToken });
});

// =======================
// 登出控制器
// =======================

const logout = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    try {
      console.log("Entering controllers\\authController.js");
      console.log("Entering controllers\\authController.js");
      console.log("Entering controllers\\authController.js");
      console.log("Entering controllers\\authController.js");
      const decoded = jwt.verify(token, JWT_SECRET);
      const expiry = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiry > 0) {
        await redisClient.setEx(token, expiry, 'blacklisted');
        console.info(`Token 已被加入黑名单：${token}`);
      }
    } catch (err) {
      console.warn(`登出时 Token 验证失败：${err.message}`);
      // 即使 Token 无效，也继续登出流程
    }
  }

  console.info(`用户登出成功，userId: ${req.userId}`);
  res.status(200).json({ message: '登出成功' });
});

// =======================
// 刷新 Token 控制器
// =======================

const refreshTokenController = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('刷新 Token 失败：缺少或错误的 Authorization 头部');
    return res.status(403).json({ error: '无效的刷新 Token' });
  }

  const refreshToken = authHeader.split(' ')[1];

  const userId = await redisClient.get(refreshToken);
  if (!userId) {
    console.warn('刷新 Token 失败：刷新 Token 不存在或已过期');
    return res.status(403).json({ error: '无效的刷新 Token' });
  }

  let decoded;
  try {
    console.log("Entering controllers\\authController.js");
    console.log("Entering controllers\\authController.js");
    console.log("Entering controllers\\authController.js");
    console.log("Entering controllers\\authController.js");
    decoded = jwt.verify(refreshToken, JWT_SECRET);
  } catch (err) {
    console.warn(`刷新 Token 失败：${err.message}`);
    console.log("Exiting controllers\\authController.js with status code");
    console.log("Exiting controllers\\authController.js with status code");
    console.log("Exiting controllers\\authController.js with status code");
    console.log("Exiting controllers\\authController.js with status code");
    return res.status(403).json({ error: '无效的刷新 Token' });
  }

  const { userId: decodedUserId, role } = decoded;

  // 确认刷新 Token 所属用户与请求中获取的用户一致
  if (userId !== decodedUserId) {
    console.warn('刷新 Token 失败：用户 ID 不匹配');
    return res.status(403).json({ error: '无效的刷新 Token' });
  }

  // 生成新的 JWT Token
  const newToken = generateToken(decodedUserId, role);

  // 生成新的刷新 Token
  const newRefreshToken = jwt.sign(
    { userId: decodedUserId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // 将新的刷新 Token 存入 Redis，并删除旧的刷新 Token
  await redisClient.set(newRefreshToken, decodedUserId, { EX: 7 * 24 * 60 * 60 });
  await redisClient.del(refreshToken);

  console.info(`Token 刷新成功：新 Token: ${newToken}, 新刷新 Token: ${newRefreshToken}`);

  res.status(200).json({ token: newToken, refreshToken: newRefreshToken });
});

// =======================
// 验证 JWT Token 中间件
// =======================

const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('授权失败：缺少或错误的 Authorization 头部');
    return res.status(401).json({ error: '授权失败，请提供 Token' });
  }

  const token = authHeader.split(' ')[1];

  // 检查 Token 是否在黑名单中
  const isBlacklisted = await redisClient.get(token);
  if (isBlacklisted) {
    console.warn(`Token 已失效或被加入黑名单：${token}`);
    return res.status(401).json({ error: 'Token 已失效，请重新登录' });
  }

  try {
    console.log("Entering controllers\\authController.js");
    console.log("Entering controllers\\authController.js");
    console.log("Entering controllers\\authController.js");
    console.log("Entering controllers\\authController.js");
    // 验证 Token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    console.info(`Token 验证成功：用户ID ${req.userId}, 角色 ${req.role}`);
    next();
  } catch (err) {
    console.warn(`Token 验证失败：${err.message}`);
    console.log("Exiting controllers\\authController.js with status code");
    console.log("Exiting controllers\\authController.js with status code");
    console.log("Exiting controllers\\authController.js with status code");
    console.log("Exiting controllers\\authController.js with status code");
    return res.status(401).json({ error: '无效的 Token，请重新登录' });
  }
});

// =======================
// 导出所有控制器函数
// =======================

module.exports = {
  // 用户注册
  registerCustomer,
  registerRestaurant,
  registerDeliveryPerson,
  registerAdmin,

  // 用户登录
  login,

  // 登出
  logout,

  // 刷新 Token
  refreshTokenController,

  // 验证 Token
  verifyToken,
};
