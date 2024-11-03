import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/sockets/constants.js

/**
 * 订单房间名前缀，用于 Socket.IO 房间的命名，确保房间名称的一致性和可预测性。
 * @type {string}
 */
export const ROOM_PREFIX = 'order_';

/**
 * Socket 事件名称枚举，定义了客户端和服务器之间的所有通信事件名称。
 * 使用 Object.freeze 冻结对象，防止事件名称的意外修改。
 * @enum {string}
 */
export const Event = Object.freeze({
  JOIN_ORDER_ROOM: 'joinOrderRoom', // 客户端加入订单房间
  STATUS_CHANGE: 'statusChange', // 订单状态变更
  ORDER_STATUS_UPDATE: 'orderStatusUpdate', // 订单状态更新
  DISCONNECT: 'disconnect', // 客户端断开连接
});
