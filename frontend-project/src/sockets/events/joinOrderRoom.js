import { storeAuthToken } from "@utils/tokenStorage";
// src/sockets/events/joinOrderRoom.js
import Joi from 'joi';
import { isValidOrderId } from '@services/orderService'; // 假设有此服务
import {
  JOIN_ORDER_ROOM,
  JOINED_ORDER_ROOM,
  SOCKET_ERROR,
} from '@utils/constants/socketEvents'; // 假设有此常量文件

const joinOrderRoomSchema = Joi.object({
  orderId: Joi.string().uuid().required(), // 假设 orderId 是 UUID
});

/**
 * 处理客户端加入订单房间事件
 * @param {import('socket.io').Socket} socket - 客户端 Socket 实例
 * @param {import('socket.io').Server} io - Socket.IO 服务器实例
 */
const joinOrderRoomHandler = (socket, io) => {
  socket.on(JOIN_ORDER_ROOM, async (data) => {
    const { error, value } = joinOrderRoomSchema.validate(data);
    if (error) {
      console.warn(
        `Invalid ${JOIN_ORDER_ROOM} data from ${socket.id}:`,
        error.details
      );
      socket.emit(SOCKET_ERROR, 'Invalid data for joinOrderRoom');
      return;
    }
    const { orderId } = value;
    const roomName = `order_${orderId}`;
    try {
      const isValid = await isValidOrderId(orderId);
      if (!isValid) {
        console.warn(
          `Attempt to join invalid order room by ${socket.id}: ${orderId}`
        );
        socket.emit(SOCKET_ERROR, 'Invalid orderId');
        return;
      }
      socket.join(roomName);
      console.info(`Socket ${socket.id} joined room: ${roomName}`);
      socket.emit(JOINED_ORDER_ROOM, {
        room: roomName,
      });
    } catch (err) {
      console.error(
        `Error validating orderId ${orderId} for socket ${socket.id}:`,
        err
      );
      socket.emit(SOCKET_ERROR, 'Server error while joining room');
    }
  });
};
export default joinOrderRoomHandler;
