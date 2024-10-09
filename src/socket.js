// src/socket.js
import { io } from 'socket.io-client';

let socket; // 保存唯一的 Socket.IO 实例
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let previousAuthToken = null;
const RECONNECTION_DELAY_INITIAL = 1000; // 初始化重连延迟
let reconnectDelay = RECONNECTION_DELAY_INITIAL;

/**
 * 初始化 Socket.IO 客户端
 */
export const connectSocket = () => {
  const authToken = localStorage.getItem('authToken'); // 获取最新的 Token

  // 如果没有 Token，无法建立连接
  if (!authToken) {
    console.error('无法建立 Socket.IO 连接，因为缺少 Token');
    return;
  }

  // 如果 Token 没有变化且 Socket 已经连接，则不重新连接
  if (authToken === previousAuthToken && socket && socket.connected) {
    console.warn('Socket 已经连接且 Token 未变更，不需要重新连接');
    return;
  }

  previousAuthToken = authToken; // 更新存储的 Token 以便跟踪

  // 如果 Socket 已经存在，则清理掉之前的连接
  if (socket) {
    socket.off(); // 清除现有的所有事件监听器
    socket.disconnect(); // 断开现有的 Socket 连接
    socket = null;
  }

  // 使用新的 Token 建立 Socket.IO 连接
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
  socket = io(`${SOCKET_URL}/orders`, {
    transports: ['websocket'],
    auth: {
      token: authToken, // 确保这里的 Token 是最新的
    },
    reconnection: true, // 自动重连
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: reconnectDelay,
  });

  setupSocketListeners(); // 设置 Socket.IO 的事件监听器
};

/**
 * 设置 Socket.IO 事件监听器
 */
const setupSocketListeners = () => {
  if (!socket) return;

  // 处理 Socket.IO 的事件
  socket.on('connect', () => {
    console.log('已连接到 WebSocket 服务器');
    reconnectAttempts = 0; // 重置重连次数
    reconnectDelay = RECONNECTION_DELAY_INITIAL; // 重置重连延迟
  });

  socket.on('message', (data) => console.log('从服务器收到消息:', data));

  socket.on('disconnect', (reason) => {
    console.log('已从 WebSocket 服务器断开连接，原因:', reason);
    if (reason === 'io server disconnect') {
      // 手动断开时，不进行重连
      return;
    }
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`正在尝试重新连接... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      setTimeout(() => connectSocket(), reconnectDelay);
      reconnectDelay *= 2; // 增加重连延迟（逐步退避策略）
    } else {
      console.warn('已达到最大重连次数，停止尝试重新连接');
      // 在这里可以通知用户手动尝试重新连接
    }
  });

  socket.on('error', (error) => console.error('WebSocket 错误:', error));
  socket.on('connect_error', (error) => console.error('WebSocket 连接失败:', error));
};

/**
 * 获取当前 Socket 实例
 * @returns {Socket} - Socket.IO 客户端实例
 */
export const getSocket = () => {
  if (!socket) {
    connectSocket();
  }
  return socket;
};

/**
 * 重新初始化 Socket 连接（在 Token 更新时使用）
 */
export const reconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket.connect();
  }
};

/**
 * 断开 Socket 连接（在登出时使用）
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.off(); // 清除所有事件监听器
    socket.disconnect(); // 断开连接
    socket = null;
    reconnectAttempts = 0; // 重置重连次数
    reconnectDelay = RECONNECTION_DELAY_INITIAL; // 重置重连延迟
    previousAuthToken = null; // 清除已保存的 Token
    console.log('已断开 Socket 连接并清除 Socket 实例');
  }
};

/**
 * 加入指定的订单房间
 * @param {string} orderId - 订单的唯一识别码
 */
export const joinOrderRoom = (orderId) => {
  if (socket && socket.connected) {
    socket.emit('joinOrderRoom', { orderId });
    console.log(`已加入订单房间: ${orderId}`);
  } else {
    console.warn('Socket 尚未连接，无法加入订单房间');
  }
};

/**
 * 离开指定的订单房间
 * @param {string} orderId - 订单的唯一识别码
 */
export const leaveOrderRoom = (orderId) => {
  if (socket && socket.connected) {
    socket.emit('leaveOrderRoom', { orderId });
    console.log(`已离开订单房间: ${orderId}`);
  } else {
    console.warn('Socket 尚未连接，无法离开订单房间');
  }
};