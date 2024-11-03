// backend-project/controllers/notificationController.js

const Notification = require('../models/Notification');
const User = require('../models/User');
const Order = require('../models/Order');
// const logger = require('../utils/logger');
const Joi = require('joi');

/**
 * 定義創建通知的驗證 schema
 */
const createNotificationSchema = Joi.object({
  recipient: Joi.string().hex().length(24).required(),
  message: Joi.string().min(1).max(500).required(),
  orderId: Joi.string().hex().length(24).optional().allow(null),
  type: Joi.string().valid('order_update', 'promotion', 'system', 'other').required(),
});

/**
 * 獲取通知歷史
 * 只有通知的接收者或管理員可以查看
 */
exports.getNotifications = async (req, res) => {
  console.log("Entering getNotifications with parameters: req, res");
  try {
    console.log("Entering controllers\\notificationController.js");
    console.log("Entering controllers\\notificationController.js");
    console.log("Entering controllers\\notificationController.js");
    console.log("Entering controllers\\notificationController.js");
    const userId = req.user.id;
    const userRole = req.user.role;

    const { page = 1, limit = 20 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      console.log("Exiting controllers\\notificationController.js with status code");
      console.log("Exiting controllers\\notificationController.js with status code");
      console.log("Exiting controllers\\notificationController.js with status code");
      console.log("Exiting controllers\\notificationController.js with status code");
      console.log("Exiting getNotifications with return value: value");
      return res.status(400).json({ success: false, message: '無效的頁數參數' });
    }

    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      console.log("Exiting controllers\\notificationController.js with status code");
      console.log("Exiting controllers\\notificationController.js with status code");
      console.log("Exiting controllers\\notificationController.js with status code");
      console.log("Exiting controllers\\notificationController.js with status code");
      console.log("Exiting getNotifications with return value: value");
      return res.status(400).json({ success: false, message: '無效的限制參數' });
    }

    // 管理員可以查看所有通知，其他用戶只能查看自己的通知
    const filter = userRole === 'admin' ? {} : { recipient: userId };

    const notifications = await Notification.find(filter)
      .populate({
        path: 'orderId',
        select: 'customer status',
        populate: {
          path: 'customer',
          select: 'name email',
        },
      })
      .sort({ timestamp: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err) {
    console.error("Error in getNotifications:", err);
    console.error('獲取通知失敗:', err);
    res.status(500).json({ success: false, message: '服務器錯誤' });
  }
};

/**
 * 創建通知
 * 只有管理員或系統服務可以創建通知
 */
exports.createNotification = async (req, res) => {
  console.log("Entering createNotification with parameters: req, res");
  // 定義驗證 schema
  const { error, value } = createNotificationSchema.validate(req.body);

  if (error) {
    console.warn(`創建通知時數據驗證失敗: ${error.details[0].message}`);
    console.log("Exiting createNotification with return value: value");
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { recipient, message, orderId, type } = value;
  const requesterRole = req.user.role;

  // 授權控制：只有管理員或系統服務可以創建通知
  if (!['admin', 'system'].includes(requesterRole)) {
    console.warn(`用戶無權創建通知，角色: ${requesterRole}, 用戶 ID: ${req.user.id}`);
    console.log("Exiting createNotification with return value: value");
    return res.status(403).json({ success: false, message: '禁止訪問，您沒有相應的權限' });
  }

  try {
    console.log("Entering controllers\\notificationController.js");
    console.log("Entering controllers\\notificationController.js");
    console.log("Entering controllers\\notificationController.js");
    console.log("Entering controllers\\notificationController.js");
    // 確保 recipient 是有效的用戶
    const recipientUser = await User.findById(recipient).lean();
    if (!recipientUser) {
      console.warn(`創建通知時未找到接收者，接收者 ID: ${recipient}`);
      console.log("Exiting controllers\\notificationController.js with status code");
      console.log("Exiting controllers\\notificationController.js with status code");
      console.log("Exiting controllers\\notificationController.js with status code");
      console.log("Exiting controllers\\notificationController.js with status code");
      console.log("Exiting createNotification with return value: value");
      return res.status(404).json({ success: false, message: '接收者未找到' });
    }

    // 如果有 orderId，確保訂單存在
    let populatedOrder = null;
    if (orderId) {
      const order = await Order.findById(orderId).lean();
      if (!order) {
        console.warn(`創建通知時未找到訂單，訂單 ID: ${orderId}`);
        console.log("Exiting controllers\\notificationController.js with status code");
        console.log("Exiting controllers\\notificationController.js with status code");
        console.log("Exiting controllers\\notificationController.js with status code");
        console.log("Exiting controllers\\notificationController.js with status code");
        console.log("Exiting createNotification with return value: value");
        return res.status(404).json({ success: false, message: '相關訂單未找到' });
      }
      populatedOrder = {
        customerName: order.customerName, // 假設 Order 模型有 customerName 字段
        status: order.status,
      };
    }

    // 創建新通知
    const newNotification = new Notification({
      recipient,
      message,
      orderId: orderId || null,
      type,
      timestamp: new Date(),
    });

    const savedNotification = await newNotification.save();

    // 返回創建的通知，並可選擇是否填充相關訂單信息
    const notificationToReturn = await Notification.findById(savedNotification._id)
      .populate({
        path: 'orderId',
        select: 'customer status',
        populate: {
          path: 'customer',
          select: 'name email',
        },
      })
      .lean();

    res.status(201).json({
      success: true,
      data: notificationToReturn,
      message: '通知創建成功',
    });
  } catch (err) {
    console.error("Error in createNotification:", err);
    console.error('創建通知失敗:', err);
    res.status(500).json({ success: false, message: '服務器錯誤' });
  }
};