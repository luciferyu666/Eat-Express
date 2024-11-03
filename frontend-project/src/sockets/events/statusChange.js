import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/sockets/events/statusChange.js
import Joi from 'joi';
import { ROOM_PREFIX, Event } from '@sockets/constants';

/**
 * 定义状态变更事件的数据验证模式
 */
const statusChangeSchema = Joi.object({
  orderId: Joi.string().required(),
  status: Joi.string().required(),
});

/**
 * 处理状态变更事件
 * @param {SocketIO.Socket} socket - 客户端 Socket 实例
 * @param {SocketIO.Server} io - Socket.IO 服务器实例
 */
const handleStatusChange = (socket, io) => {
  socket.on(Event.STATUS_CHANGE, (data) => {
    const { error, value } = statusChangeSchema.validate(data);
    if (error) {
      console.warn(
        `Invalid statusChange data from ${socket.id}:`,
        error.details
      );
      socket.emit('error', {
        message: 'Invalid data for statusChange',
        details: error.details,
      });
      return;
    }
    const { orderId, status } = value;
    const roomName = `${ROOM_PREFIX}${orderId}`;
    io.to(roomName).emit(Event.STATUS_CHANGE, {
      orderId,
      status,
    });
    console.info(`Status Change emitted to room ${roomName}:`, {
      orderId,
      status,
    });
  });
};
export default handleStatusChange;
