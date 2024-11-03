import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/sockets/events/orderStatusUpdate.js
import Joi from 'joi';
import { ROOM_PREFIX, Event } from '@sockets/constants';

/**
 * 定义订单状态更新事件的数据验证模式
 * @type {Joi.ObjectSchema}
 */
const orderStatusUpdateSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  status: Joi.string()
    .valid('pending', 'confirmed', 'shipped', 'delivered')
    .required(),
  updatedAt: Joi.date().optional(),
});

/**
 * 统一的事件数据验证和错误处理
 * @param {Joi.Schema} schema - Joi验证模式
 * @param {any} data - 接收到的数据
 * @param {SocketIO.Socket} socket - 客户端 Socket 实例
 * @param {string} event - 事件名称
 * @returns {any|null} 验证后的数据或 null
 */
const validateData = (schema, data, socket, event) => {
  const { error, value } = schema.validate(data);
  if (error) {
    console.warn(`Invalid ${event} data from ${socket.id}:`, error.details);
    socket.emit('error', {
      message: `Invalid data for ${event}. Please check your input and try again.`,
    });
    return null;
  }
  return value;
};

/**
 * 处理订单状态更新事件
 * @param {SocketIO.Socket} socket - 客户端 Socket 实例
 * @param {SocketIO.Server} io - Socket.IO 服务器实例
 */
const handleOrderStatusUpdate = (socket, io) => {
  socket.on(Event.ORDER_STATUS_UPDATE, (data) => {
    const validData = validateData(
      orderStatusUpdateSchema,
      data,
      socket,
      Event.ORDER_STATUS_UPDATE
    );
    if (!validData) return;

    const { orderId, status, updatedAt } = validData;
    const roomName = `${ROOM_PREFIX}${orderId}`;
    const timestamp = updatedAt
      ? new Date(updatedAt).toISOString()
      : new Date().toISOString();

    io.to(roomName).emit(Event.ORDER_STATUS_UPDATE, {
      orderId,
      status,
      updatedAt: timestamp,
    });

    console.info(`Order Status Update emitted to room ${roomName}:`, {
      orderId,
      status,
      updatedAt: timestamp,
    });
  });
};

export default handleOrderStatusUpdate;
