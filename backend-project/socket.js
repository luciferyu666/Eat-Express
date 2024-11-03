// backend-project/socket.js

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, FRONTEND_URL } = require('./config');
const Order = require('./models/Order');
const Joi = require('joi');
const { hasOrderAccess } = require('./utils/orderUtils');
const Roles = require('./constants/roles');
// 假设有一个日志工具

// 检查 JWT_SECRET 是否设置
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 未设置');
}

let io;

/**
 * 初始化 Socket.IO 服务器
 * @param {http.Server} server - HTTP 服务器实例
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  /**
   * 全局中间件：Token 验证
   */
  io.use((socket, next) => {
    const token = socket.handshake.auth.token; // 获取 Token
    if (!token) {
      console.error('Socket 连接失败：缺少 Token');
      return next(new Error('缺少 Token'));
    }

    try {
      // 如果 Token 前有 'Bearer ' 前缀，去掉它
      const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

      // 验证 Token
      const decoded = jwt.verify(tokenValue, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.error(`Token 验证失败: ${err.message}`);
      return next(new Error('Token 验证失败'));
    }
  });

  // 定义 /orders 命名空间
  const ordersNamespace = io.of('/orders');

  /**
   * 数据验证 schema
   */
  const updateOrderSchema = Joi.object({
    orderId: Joi.string().required(),
    status: Joi.string().valid('pending', 'confirmed', 'delivered').required(),
    deliveryLocation: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }).optional(),
  });

  /**
   * 处理 /orders 命名空间的连接事件
   */
  ordersNamespace.on('connection', (socket) => {
    console.log(`用户 ${socket.user.userId} 连接到 /orders 命名空间`);

    /**
     * 处理用户加入订单房间的请求
     * @param {Object} data - 包含 orderId 的对象
     */
    socket.on('joinOrderRoom', async ({ orderId }) => {
      if (!orderId) {
        socket.emit('error', { message: '缺少 orderId' });
        return;
      }

      try {
        const order = await Order.findById(orderId);
        if (!order) {
          socket.emit('error', { message: '订单不存在' });
          return;
        }

        if (!hasOrderAccess(socket.user, order)) {
          socket.emit('error', { message: '您无权查看此订单' });
          return;
        }

        // 实现房间限制（如果需要）
        const roomsJoined = Array.from(socket.rooms).filter(room => room.startsWith('order_'));
        const MAX_ROOMS_PER_USER = 5; // 根据需求调整
        if (roomsJoined.length >= MAX_ROOMS_PER_USER) {
          socket.emit('error', { message: '您已加入过多的订单房间' });
          return;
        }

        socket.join(`order_${orderId}`);
        console.log(`用户 ${socket.user.userId} 加入订单房间: order_${orderId}`);
        socket.emit('joinedOrderRoom', { orderId });
      } catch (error) {
        console.error(`加入订单房间失败: ${error.message}`);
        socket.emit('error', { message: '加入订单房间失败' });
      }
    });

    /**
     * 处理用户离开订单房间的请求
     * @param {Object} data - 包含 orderId 的对象
     */
    socket.on('leaveOrderRoom', ({ orderId }) => {
      if (!orderId) {
        socket.emit('error', { message: '缺少 orderId' });
        return;
      }

      const roomName = `order_${orderId}`;
      if (socket.rooms.has(roomName)) { // socket.rooms 是一个 Set
        socket.leave(roomName);
        console.log(`用户 ${socket.user.userId} 离开订单房间: ${roomName}`);
        socket.emit('leftOrderRoom', { orderId });
      } else {
        socket.emit('error', { message: `未加入房间: ${roomName}` });
      }
    });

    /**
     * 处理用户更新订单状态的请求
     * @param {Object} data - 包含 orderId、status、deliveryLocation 的对象
     */
    socket.on('updateOrderStatus', async (data) => {
      const { error, value } = updateOrderSchema.validate(data);
      if (error) {
        socket.emit('error', { message: error.details[0].message });
        return;
      }

      const { orderId, status, deliveryLocation } = value;

      // 只有 delivery_person 和 restaurant_owner 有权限更新订单状态
      if (![Roles.DELIVERY_PERSON, Roles.RESTAURANT_OWNER].includes(socket.user.role)) {
        socket.emit('error', { message: '您没有权限执行此操作' });
        return;
      }

      try {
        const order = await Order.findById(orderId);
        if (!order) {
          socket.emit('error', { message: '订单不存在' });
          return;
        }

        // 检查用户是否有权更新该订单
        if (
          (socket.user.role === Roles.DELIVERY_PERSON && String(order.deliveryPerson) !== String(socket.user.userId)) ||
          (socket.user.role === Roles.RESTAURANT_OWNER && String(order.restaurant) !== String(socket.user.userId))
        ) {
          socket.emit('error', { message: '您无权更新此订单' });
          return;
        }

        // 更新订单状态和配送位置
        order.status = status;
        if (deliveryLocation) {
          order.deliveryLocation = {
            type: 'Point',
            coordinates: [deliveryLocation.lng, deliveryLocation.lat],
          };
        }
        await order.save();

        // 向所有在订单房间的用户发送订单状态更新
        ordersNamespace.to(`order_${orderId}`).emit('orderStatusUpdate', { orderId, status, deliveryLocation });
        console.log(`订单 ${orderId} 状态更新为: ${status}`);
      } catch (error) {
        console.error(`更新订单状态失败: ${error.message}`);
        socket.emit('error', { message: '更新订单状态失败' });
      }
    });

    /**
     * 处理用户发送消息的请求
     * @param {string} message - 客户端发送的消息
     */
    socket.on('message', (message) => {
      if (typeof message !== 'string' || message.trim() === '') {
        socket.emit('error', { message: '无效的消息内容' });
        return;
      }

      // 消息内容消毒，防止 XSS
      const sanitizedMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      console.log(`收到用户 ${socket.user.userId} 的消息: ${sanitizedMessage}`);

      // 向所有在订单房间的用户发送消息，而非整个命名空间
      const rooms = Array.from(socket.rooms).filter(room => room.startsWith('order_'));
      rooms.forEach(room => {
        ordersNamespace.to(room).emit('message', { userId: socket.user.userId, message: sanitizedMessage });
      });
    });

    /**
     * 处理用户断开连接的事件
     * @param {string} reason - 断开连接的原因
     */
    socket.on('disconnect', (reason) => {
      console.log(`用户 ${socket.user.userId} 断开连接。原因: ${reason}`);
      // 可以在这里进行资源清理或通知其他用户
    });
  });

  return io;
};

/**
 * 获取 Socket.IO 实例
 * @returns {SocketIO.Server} Socket.IO 服务器实例
 * @throws {Error} 如果 Socket.IO 未初始化
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io 未初始化');
  }
  return io;
};

module.exports = { initializeSocket, getIO };