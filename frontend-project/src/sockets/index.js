import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/sockets/index.js
import { Server } from 'socket.io';
import Joi from 'joi';
import {
  joinOrderRoomSchema,
  statusChangeSchema,
  orderStatusUpdateSchema,
} from '@sockets/schemas';
import { ROOM_PREFIX, Event } from '@sockets/constants';

/**
 * 获取订单房间名
 * @param {string} orderId - 订单ID
 * @returns {string} 房间名
 */
const getOrderRoom = (orderId) => `${ROOM_PREFIX}${orderId}`;

/**
 * @typedef {Object} JoinOrderRoomData
 * @property {string} orderId - 订单ID
 */

/**
 * @typedef {Object} StatusChangeData
 * @property {string} orderId - 订单ID
 * @property {string} status - 状态
 */

/**
 * @typedef {Object} OrderStatusUpdateData
 * @property {string} orderId - 订单ID
 * @property {string} status - 状态
 * @property {Date} [updatedAt] - 更新时间
 */

let io;

/**
 * 统一的事件数据验证和错误处理
 * @param {Joi.Schema} schema - Joi验证模式
 * @param {any} data - 接收到的数据
 * @param {string} socketId - 连接的socket ID
 * @param {string} event - 事件名称
 * @returns {any|null} 验证后的数据或 null
 */
const validateData = (schema, data, socketId, event) => {
  const { error, value } = schema.validate(data);
  if (error) {
    console.error(`Invalid ${event} data from ${socketId}:`, error.details);
    io.to(socketId).emit('error', {
      message: `Invalid data for ${event}`,
      details: error.details,
    });
    return null;
  }
  return value;
};

/**
 * 初始化 Socket.IO 服务器
 * @param {any} server - HTTP 服务器实例
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN
        ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
        : ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true, // 如果需要发送凭证（如 Cookies）
    },
    maxHttpBufferSize: 1e6, // 1MB
    pingTimeout: 60000, // 60秒
    pingInterval: 25000, // 25秒
  });

  io.on(Event.CONNECT, (socket) => {
    console.info(`New client connected: ${socket.id}`);

    // 处理客户端加入订单房间事件
    socket.on(Event.JOIN_ORDER_ROOM, (data) => {
      const validData = validateData(
        joinOrderRoomSchema,
        data,
        socket.id,
        Event.JOIN_ORDER_ROOM
      );
      if (!validData) return;

      const roomName = getOrderRoom(validData.orderId);
      socket.join(roomName);
      console.info(`Socket ${socket.id} joined room: ${roomName}`);
      socket.emit('joinedOrderRoom', { room: roomName });
    });

    // 处理状态变更事件
    socket.on(Event.STATUS_CHANGE, (data) => {
      const validData = validateData(
        statusChangeSchema,
        data,
        socket.id,
        Event.STATUS_CHANGE
      );
      if (!validData) return;

      const roomName = getOrderRoom(validData.orderId);
      io.to(roomName).emit(Event.STATUS_CHANGE, {
        orderId: validData.orderId,
        status: validData.status,
      });
      console.info(`Status Change emitted to room ${roomName}:`, {
        orderId: validData.orderId,
        status: validData.status,
      });
    });

    // 处理订单状态更新事件
    socket.on(Event.ORDER_STATUS_UPDATE, (data) => {
      const validData = validateData(
        orderStatusUpdateSchema,
        data,
        socket.id,
        Event.ORDER_STATUS_UPDATE
      );
      if (!validData) return;

      const roomName = getOrderRoom(validData.orderId);
      io.to(roomName).emit(Event.ORDER_STATUS_UPDATE, {
        orderId: validData.orderId,
        status: validData.status,
        updatedAt: validData.updatedAt || new Date(),
      });
      console.info(`Order Status Update emitted to room ${roomName}:`, {
        orderId: validData.orderId,
        status: validData.status,
        updatedAt: validData.updatedAt || new Date(),
      });
    });

    // 处理客户端断开连接事件
    socket.on(Event.DISCONNECT, (reason) => {
      console.info(`Client disconnected: ${socket.id} - Reason: ${reason}`);
    });
  });
};

/**
 * 获取已初始化的 Socket.IO 实例
 * @returns {Server} Socket.IO 实例
 * @throws {Error} 如果 Socket.IO 尚未初始化
 */
export const getIOInstance = () => {
  if (!io) {
    throw new Error(
      'Socket.io not initialized! Make sure to call initSocket(server) before using getIOInstance().'
    );
  }
  return io;
};
