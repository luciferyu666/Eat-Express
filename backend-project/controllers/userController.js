// backend-project/controllers/userController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const User = require('../models/User'); // 引入 User 模型
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/config'); // 引入配置
const ROLES = require('../constants/roles'); // 导入 ROLES 常量

/**
 * 注册新用户
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 中间件函数
 */
const registerUser = async (req, res, next) => {
  // 定义注册验证 schema
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('customer', 'admin', 'delivery_person', 'restaurant').required(),
  });

  try {
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    // 验证请求体
    const { error, value } = schema.validate(req.body);
    if (error) {
      console.warn(`注册数据验证失败: ${error.details[0].message}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, role } = value;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn(`注册用户已存在，电子邮件: ${email}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(409).json({ message: '用户已存在' });
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    // 生成 JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: '用户注册成功',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    console.info(`用户注册成功，用户 ID: ${user._id}, 角色: ${user.role}`);
  } catch (err) {
    console.error('注册用户错误:', err);
    next(err);
  }
};

/**
 * 用户登录
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 中间件函数
 */
const loginUser = async (req, res, next) => {
  // 定义登录验证 schema
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  try {
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    // 验证请求体
    const { error, value } = schema.validate(req.body);
    if (error) {
      console.warn(`登录数据验证失败: ${error.details[0].message}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`登录失败，未找到用户，电子邮件: ${email}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(401).json({ message: '无效的凭证' });
    }

    // 比较密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`登录失败，密码不匹配，用户 ID: ${user._id}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(401).json({ message: '无效的凭证' });
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: '登录成功',
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    console.info(`用户登录成功，用户 ID: ${user._id}, 角色: ${user.role}`);
  } catch (err) {
    console.error('登录错误:', err);
    next(err);
  }
};

/**
 * 获取当前用户的资料
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 中间件函数
 */
const getUserProfile = async (req, res, next) => {
  try {
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log(`获取用户资料，请求用户 ID: ${req.user.userId}`);
    const user = await User.findById(req.user.userId).select('-password -__v');
    if (!user) {
      console.warn(`用户未找到，用户 ID: ${req.user.userId}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(404).json({ message: '用户未找到' });
    }

    res.status(200).json({ user });
    console.info(`获取用户资料成功，用户 ID: ${req.user.userId}`);
  } catch (err) {
    console.error('获取用户资料错误:', err);
    next(err);
  }
};

/**
 * 更新当前用户的资料
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 中间件函数
 */
const updateUserProfile = async (req, res, next) => {
  // 定义更新验证 schema
  const schema = Joi.object({
    name: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(), // E.164 格式
    address: Joi.string().optional(),
    // 其他可更新字段...
  });

  try {
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    // 验证请求体
    const { error, value } = schema.validate(req.body);
    if (error) {
      console.warn(`更新用户资料数据验证失败: ${error.details[0].message}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(400).json({ message: error.details[0].message });
    }

    const updates = { ...value };

    // 如果更新密码，哈希新密码
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    console.log(`更新用户资料，用户 ID: ${req.user.userId}`);

    // 更新用户
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password -__v');

    if (!user) {
      console.warn(`用户未找到，用户 ID: ${req.user.userId}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(404).json({ message: '用户未找到' });
    }

    res.status(200).json({
      message: '用户资料更新成功',
      user,
    });
    console.info(`用户资料更新成功，用户 ID: ${req.user.userId}`);
  } catch (err) {
    console.error('更新用户资料错误:', err);
    next(err);
  }
};

/**
 * 获取所有用户（仅管理员可用）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 中间件函数
 */
const getAllUsers = async (req, res, next) => {
  try {
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log(`获取所有用户，请求用户 ID: ${req.user.userId}, 角色: ${req.user.role}`);
    // 确保只有管理员可以访问
    if (req.user.role !== ROLES.ADMIN) {
      console.warn(`用户无权获取所有用户，用户 ID: ${req.user.userId}, 角色: ${req.user.role}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(403).json({ message: '禁止访问' });
    }

    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const users = await User.find()
      .select('-password -__v')
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    const total = await User.countDocuments();

    res.status(200).json({ total, page: parsedPage, limit: parsedLimit, users });
    console.info(`获取所有用户成功，当前页数: ${parsedPage}, 返回数量: ${users.length}`);
  } catch (err) {
    console.error('获取所有用户错误:', err);
    next(err);
  }
};

/**
 * 删除用户（仅管理员可用）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 中间件函数
 */
const deleteUser = async (req, res, next) => {
  try {
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    const { id } = req.params;
    console.log(`删除用户请求，目标用户 ID: ${id}, 请求用户 ID: ${req.user.userId}, 角色: ${req.user.role}`);

    // 确保只有管理员可以删除用户
    if (req.user.role !== ROLES.ADMIN) {
      console.warn(`用户无权删除用户，用户 ID: ${req.user.userId}, 角色: ${req.user.role}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(403).json({ message: '禁止访问' });
    }

    const user = await User.findByIdAndDelete(id).select('-password -__v');
    if (!user) {
      console.warn(`删除用户失败，用户未找到，用户 ID: ${id}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(404).json({ message: '用户未找到' });
    }

    res.status(200).json({ message: '用户已删除', user });
    console.info(`用户已删除，用户 ID: ${id}`);
  } catch (err) {
    console.error('删除用户错误:', err);
    next(err);
  }
};

/**
 * 更新用户角色（仅管理员可用）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 中间件函数
 */
const updateUserRole = async (req, res, next) => {
  // 定义角色更新验证 schema
  const schema = Joi.object({
    role: Joi.string().valid('customer', 'admin', 'delivery_person', 'restaurant').required(),
  });

  try {
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    console.log("Entering controllers\\userController.js");
    const { id } = req.params;
    console.log(`更新用户角色请求，目标用户 ID: ${id}, 请求用户 ID: ${req.user.userId}, 角色: ${req.user.role}`);

    // 确保只有管理员可以更新用户角色
    if (req.user.role !== ROLES.ADMIN) {
      console.warn(`用户无权更新用户角色，用户 ID: ${req.user.userId}, 角色: ${req.user.role}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(403).json({ message: '禁止访问' });
    }

    // 验证请求体
    const { error, value } = schema.validate(req.body);
    if (error) {
      console.warn(`更新用户角色数据验证失败: ${error.details[0].message}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(400).json({ message: error.details[0].message });
    }

    const { role } = value;

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password -__v');

    if (!user) {
      console.warn(`更新用户角色失败，用户未找到，用户 ID: ${id}`);
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      console.log("Exiting controllers\\userController.js with status code");
      return res.status(404).json({ message: '用户未找到' });
    }

    res.status(200).json({
      message: '用户角色更新成功',
      user,
    });
    console.info(`用户角色更新成功，用户 ID: ${id}, 新角色: ${role}`);
  } catch (err) {
    console.error('更新用户角色错误:', err);
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  updateUserRole,
};