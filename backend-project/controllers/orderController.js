// src/controllers/orderController.js

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User'); // 確保引入 User 模型
const { assignOrderToDeliveryPerson } = require('../services/orderAssignmentService');
// const logger = require('../utils/logger');
const Joi = require('joi');

/**
 * 處理 API 請求的成功回應
 * @param {Object} res - Express響應對象
 * @param {number} statusCode - HTTP狀態碼
 * @param {Object} data - 要返回的數據
 */
const handleResponse = (res, statusCode, data) => {
  res.status(statusCode).json(data);
};

/**
 * 處理 API 請求的錯誤回應
 * @param {Object} res - Express響應對象
 * @param {Object} error - 錯誤對象
 * @param {string} message - 錯誤訊息
 */
const handleError = (res, error, message) => {
  console.error(`${message}:`, error);
  res.status(500).json({ message: 'Internal server error.' });
};

/**
 * 創建新訂單並自動分配外送員
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 */
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    // 定義驗證 schema
    const schema = Joi.object({
      // 移除 customerId，使用 req.user.id
      restaurantId: Joi.string().hex().length(24).required(),
      items: Joi.array().items(
        Joi.object({
          productId: Joi.string().hex().length(24).required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      ).min(1).required(),
      preparationTime: Joi.number().integer().min(0).required(),
      deliveryTime: Joi.number().integer().min(0).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      console.warn(`數據驗證失敗: ${error.details[0].message}`);
      await session.abortTransaction();
      session.endSession();
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(400).json({ error: error.details[0].message });
    }

    const { restaurantId, items, preparationTime, deliveryTime } = value;

    // 獲取餐廳詳細信息
    const restaurant = await Restaurant.findById(restaurantId).session(session);
    if (!restaurant) {
      console.warn(`餐廳未找到，餐廳 ID: ${restaurantId}`);
      await session.abortTransaction();
      session.endSession();
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(404).json({ error: '餐廳未找到' });
    }

    // 創建新訂單
    const newOrder = new Order({
      customer: req.user.id, // 使用登錄用戶的 ID
      restaurant: restaurantId,
      items,
      preparationTime,
      deliveryTime,
      status: 'pending',
      deliveryAddress: req.body.deliveryAddress || '', // 確保有配送地址
      customerLocation: req.body.customerLocation || {
        type: 'Point',
        coordinates: [0, 0],
      },
      deliveryLocation: null, // 初始設置為 null
    });

    await newOrder.save({ session });

    // 自動分配外送員
    const assignedDeliveryPerson = await assignOrderToDeliveryPerson(newOrder);

    if (assignedDeliveryPerson) {
      newOrder.deliveryPerson = assignedDeliveryPerson._id;
      newOrder.status = 'assigned';
      await newOrder.save({ session });

      // 發送 Socket.IO 事件
      if (req.app.locals.io) {
        req.app.locals.io.emit('orderAssigned', {
          orderId: newOrder._id,
          deliveryPersonId: assignedDeliveryPerson._id,
        });
      }

      await session.commitTransaction();
      session.endSession();

      console.log("Exiting controllers\\orderController.js with status code");

      console.log("Exiting controllers\\orderController.js with status code");

      console.log("Exiting controllers\\orderController.js with status code");

      console.log("Exiting controllers\\orderController.js with status code");

      return handleResponse(res, 201, {
        message: 'Order created and assigned successfully.',
        order: newOrder,
        deliveryPerson: assignedDeliveryPerson,
      });
    } else {
      await session.commitTransaction();
      session.endSession();

      console.log("Exiting controllers\\orderController.js with status code");

      console.log("Exiting controllers\\orderController.js with status code");

      console.log("Exiting controllers\\orderController.js with status code");

      console.log("Exiting controllers\\orderController.js with status code");

      return handleResponse(res, 200, {
        message: 'Order created but no delivery person available at the moment.',
        order: newOrder,
      });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    handleError(res, error, 'Error creating order');
  }
};

/**
 * 獲取所有訂單（僅限管理員）
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - 下一個中間件函數
 */
const getAllOrders = async (req, res, next) => {
  try {
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    const { page = 1, limit = 10 } = req.query;
    let pageNumber = parseInt(page, 10);
    let limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) pageNumber = 1;
    if (isNaN(limitNumber) || limitNumber < 1) limitNumber = 10;

    // 只有管理員才能獲取所有訂單
    if (req.user.role !== 'admin') {
      console.warn(`用戶無權獲取所有訂單，角色: ${req.user.role}, 用戶 ID: ${req.user.id}`);
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(403).json({ error: '您沒有權限獲取所有訂單' });
    }

    const orders = await Order.find()
      .populate('deliveryPerson', 'username name email phone')
      .populate('restaurant', 'name address')
      .populate('customer', 'username name email phone')
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    const total = await Order.countDocuments().exec();

    handleResponse(res, 200, { total, page: pageNumber, limit: limitNumber, orders });
    console.info(`獲取所有訂單成功，總數: ${total}, 當前頁數: ${pageNumber}, 返回數量: ${orders.length}`);
  } catch (error) {
    handleError(res, error, '獲取所有訂單失敗');
  }
};

/**
 * 根據 ID 獲取訂單
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - 下一個中間件函數
 */
const getOrderById = async (req, res, next) => {
  try {
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    const { orderId } = req.params;

    // 驗證 orderId 是否為有效的 ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.warn(`無效的訂單 ID: ${orderId}`);
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(400).json({ error: '無效的訂單 ID' });
    }

    const order = await Order.findById(orderId)
      .populate('deliveryPerson', 'username name email phone')
      .populate('restaurant', 'name address')
      .populate('customer', 'username name email phone')
      .exec();

    if (!order) {
      console.warn(`訂單未找到，訂單 ID: ${orderId}`);
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(404).json({ error: '訂單未找到' });
    }

    // 只有訂單的客戶、分配的外送員或管理員可以查看訂單
    if (
      req.user.role !== 'admin' &&
      order.customer.toString() !== req.user.id &&
      (order.deliveryPerson ? order.deliveryPerson.toString() !== req.user.id : true)
    ) {
      console.warn(`用戶無權查看此訂單，訂單 ID: ${orderId}, 用戶 ID: ${req.user.id}`);
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(403).json({ error: '您沒有權限查看此訂單' });
    }

    handleResponse(res, 200, order);
    console.info(`獲取訂單成功，訂單 ID: ${orderId}`);
  } catch (error) {
    handleError(res, error, '獲取訂單失敗');
  }
};

/**
 * 獲取當前用戶的訂單（客戶或外送員）
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - 下一個中間件函數
 */
const getCurrentOrders = async (req, res, next) => {
  try {
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    const userId = req.user.id;
    const role = req.user.role;
    let { page = 1, limit = 10 } = req.query;
    let pageNumber = parseInt(page, 10);
    let limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) pageNumber = 1;
    if (isNaN(limitNumber) || limitNumber < 1) limitNumber = 10;

    let filter = {};
    if (role === 'customer') {
      filter.customer = userId;
    } else if (role === 'delivery_person') {
      filter.deliveryPerson = userId;
    } else {
      console.warn(`用戶無權查看當前訂單，角色: ${role}, 用戶 ID: ${userId}`);
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(403).json({ error: '您沒有權限查看當前訂單' });
    }

    const orders = await Order.find(filter)
      .populate('deliveryPerson', 'username name email phone')
      .populate('restaurant', 'name address')
      .populate('customer', 'username name email phone')
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    const total = await Order.countDocuments(filter).exec();

    handleResponse(res, 200, { total, page: pageNumber, limit: limitNumber, orders });
    console.info(`獲取當前訂單成功，角色: ${role}, 用戶 ID: ${userId}, 總數: ${total}, 當前頁數: ${pageNumber}, 返回數量: ${orders.length}`);
  } catch (error) {
    handleError(res, error, '獲取當前訂單失敗');
  }
};

/**
 * 更新訂單狀態
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - 下一個中間件函數
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    // 定義驗證 schema
    const schema = Joi.object({
      status: Joi.string().valid('pending', 'assigned', 'in_transit', 'delivered', 'cancelled').required(),
    });

    const { error, value } = schema.validate({ status });
    if (error) {
      console.warn(`數據驗證失敗: ${error.details[0].message}`);
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(400).json({ error: error.details[0].message });
    }

    const newStatus = value.status;

    // 驗證 orderId 是否為有效的 ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.warn(`無效的訂單 ID: ${orderId}`);
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(400).json({ error: '無效的訂單 ID' });
    }

    const order = await Order.findById(orderId).exec();
    if (!order) {
      console.warn(`訂單未找到，訂單 ID: ${orderId}`);
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(404).json({ error: '訂單未找到' });
    }

    // 檢查用戶是否有權限更新訂單
    if (role === 'delivery_person' && order.deliveryPerson.toString() !== userId) {
      console.warn(`用戶無權更新此訂單，訂單 ID: ${orderId}, 用戶 ID: ${userId}`);
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(403).json({ error: '您無權更新此訂單' });
    }

    // 根據角色和新狀態進行進一步的權限檢查
    if (role === 'delivery_person') {
      const validTransitions = {
        assigned: ['in_transit', 'cancelled'],
        in_transit: ['delivered', 'cancelled'],
      };

      if (!validTransitions[order.status] || !validTransitions[order.status].includes(newStatus)) {
        console.warn(`無效的狀態轉換，訂單 ID: ${orderId}, 當前狀態: ${order.status}, 新狀態: ${newStatus}`);
        console.log("Exiting controllers\\orderController.js with status code");
        console.log("Exiting controllers\\orderController.js with status code");
        console.log("Exiting controllers\\orderController.js with status code");
        console.log("Exiting controllers\\orderController.js with status code");
        return res.status(400).json({ error: `無效的狀態轉換從 ${order.status} 到 ${newStatus}` });
      }
    }

    // 更新訂單狀態
    order.status = newStatus;

    // 如果訂單被取消，釋放外送員的可用性
    if (newStatus === 'cancelled' && order.deliveryPerson) {
      const deliveryPerson = await User.findById(order.deliveryPerson).exec();
      if (deliveryPerson) {
        deliveryPerson.availability = true;
        await deliveryPerson.save();
      }
    }

    await order.save();

    // 發送 Socket.IO 事件
    if (req.app.locals.io) {
      req.app.locals.io.emit('orderStatusUpdated', {
        orderId: order._id,
        status: newStatus,
      });
    }

    handleResponse(res, 200, order);
    console.info(`訂單狀態更新成功，訂單 ID: ${orderId}, 新狀態: ${newStatus}`);
  } catch (error) {
    handleError(res, error, '更新訂單狀態失敗');
  }
};

/**
 * 刪除訂單（僅限管理員）
 * @param {Object} req - Express請求對象
 * @param {Object} res - Express響應對象
 * @param {Function} next - 下一個中間件函數
 */
const deleteOrder = async (req, res, next) => {
  try {
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    console.log("Entering controllers\\orderController.js");
    const { orderId } = req.params;
    const role = req.user.role;

    // 驗證 orderId 是否為有效的 ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.warn(`無效的訂單 ID: ${orderId}`);
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(400).json({ error: '無效的訂單 ID' });
    }

    if (role !== 'admin') {
      console.warn(`用戶無權刪除訂單，訂單 ID: ${orderId}, 用戶角色: ${role}`);
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(403).json({ error: '您沒有權限刪除訂單' });
    }

    const order = await Order.findByIdAndDelete(orderId).exec();
    if (!order) {
      console.warn(`訂單未找到或已被刪除，訂單 ID: ${orderId}`);
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      console.log("Exiting controllers\\orderController.js with status code");
      return res.status(404).json({ error: '訂單未找到' });
    }

    // 如果訂單被刪除，釋放外送員的可用性
    if (order.deliveryPerson) {
      const deliveryPerson = await User.findById(order.deliveryPerson).exec();
      if (deliveryPerson) {
        deliveryPerson.availability = true;
        await deliveryPerson.save();
      }
    }

    // 發送 Socket.IO 事件
    if (req.app.locals.io) {
      req.app.locals.io.emit('orderDeleted', { orderId: order._id });
    }

    handleResponse(res, 200, { message: '訂單已刪除' });
    console.info(`訂單已刪除，訂單 ID: ${orderId}`);
  } catch (error) {
    handleError(res, error, '刪除訂單失敗');
  }
};

// 將所有控制器函數導出
module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getCurrentOrders,
  updateOrderStatus,
  deleteOrder,
};