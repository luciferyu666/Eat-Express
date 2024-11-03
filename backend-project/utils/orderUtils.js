// backend-project/utils/orderUtils.js

const Joi = require('joi');
const { UserRole } = require('./constants');

/**
 * 订单对象的验证 schema
 */
const orderSchema = Joi.object({
  customer: Joi.string().required(),
  deliveryPerson: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).required(),
  totalPrice: Joi.number().precision(2).required(),
  status: Joi.string().valid('pending', 'assigned', 'in_transit', 'delivered', 'cancelled').required(),
  createdAt: Joi.date().default(Date.now),
  updatedAt: Joi.date().default(Date.now),
  // 根据实际需求添加更多字段
});

/**
 * 用户对象的验证 schema
 */
const userSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid(...Object.values(UserRole)).required(),
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  // 根据实际需求添加更多字段
});

/**
 * 验证对象的通用函数
 * @param {Joi.ObjectSchema} schema - Joi 验证 schema
 * @param {Object} object - 需要验证的对象
 * @returns {Object} - 验证后的对象
 * @throws {Joi.ValidationError} - 如果验证失败
 */
const validate = (schema, object) => {
  const { error, value } = schema.validate(object);
  if (error) {
    throw error;
  }
  return value;
};

/**
 * 处理订单的逻辑
 * @param {Object} order - 订单对象
 * @returns {Object} 处理后的订单对象
 * @throws {Error} 如果订单对象无效
 */
const processOrder = (order) => {
  try {
    const validatedOrder = validate(orderSchema, order);
    // 处理订单的具体逻辑
    // 例如：验证库存、计算总价、更新订单状态等
    // 此处为示例，直接返回订单对象
    return validatedOrder;
  } catch (error) {
    handleError(error, 'processOrder');
  }
};

/**
 * 判断用户是否有权访问特定订单
 * @param {Object} user - 用户对象
 * @param {Object} order - 订单对象
 * @returns {boolean} 如果有访问权限，返回 true，否则返回 false
 * @throws {Error} 如果输入参数无效
 */
const hasOrderAccess = (user, order) => {
  try {
    const validatedUser = validate(userSchema, user);
    const validatedOrder = validate(orderSchema, order);

    // 检查用户角色和对应的权限
    if (validatedUser.role === UserRole.CUSTOMER && validatedOrder.customer === validatedUser.userId) {
      return true;
    }
    if (validatedUser.role === UserRole.DELIVERY_PERSON && validatedOrder.deliveryPerson === validatedUser.userId) {
      return true;
    }
    if (validatedUser.role === UserRole.ADMIN) {
      return true; // 管理员有权访问所有订单
    }

    return false;
  } catch (error) {
    handleError(error, 'hasOrderAccess');
  }
};

/**
 * 处理错误的通用函数
 * @param {Joi.ValidationError | any} error - 错误对象
 * @param {string} context - 出错上下文
 * @throws {Error} - 抛出处理后的错误
 */
const handleError = (error, context) => {
  if (error.isJoi) {
    // 数据验证错误
    console.error(`${context}: 数据验证失败 - ${error.message}`);
    throw new Error('输入数据无效');
  }

  if (error.response) {
    // 后端返回错误
    const status = error.response.status;
    const message = error.response.data.message || '服务器错误';
    
    if (status === 401) {
      // 未授权错误
      console.error(`${context}: 未授权 - ${message}`);
      throw new Error('未授权，请登录');
    }

    console.error(`${context}: ${message}`);
    throw new Error(message);
  } else if (error.request) {
    // 请求已发出，但未收到响应
    console.error(`${context}: 未收到服务器响应`);
    throw new Error('无法连接到服务器，请稍后重试');
  } else {
    // 其他错误
    console.error(`${context}: ${error.message}`);
    throw new Error('发生未知错误');
  }
};

module.exports = {
  processOrder,
  hasOrderAccess
};