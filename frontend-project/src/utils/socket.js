import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/utils/socket.js

import { io } from 'socket.io-client';
import jwtDecode from 'jwt-decode';
import axiosInstance from '@utils/axiosInstance';
import { toast } from 'react-toastify'; // 引入通知库，如 react-toastify
import { handleOrderStatusUpdate, handleMessage } from '@utils/socketEvents'; // 分离事件处理逻辑

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECTION_DELAY_INITIAL = 1000; // Initial reconnection delay in ms
const MAX_RECONNECTION_DELAY = 16000; // Maximum reconnection delay in ms

let socket = null; // Singleton Socket.IO instance
let reconnectAttempts = 0;
let previousToken = null;
let reconnectDelay = RECONNECTION_DELAY_INITIAL;
let isRefreshing = false; // Flag to prevent multiple refresh attempts

/**
 * Refresh Auth Token using axiosInstance
 * @returns {Promise<string|null>} New token or null if refresh failed
 */
const refreshAuthToken = async () => {
  try {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (refreshToken) {
      const response = await axiosInstance.post('/auth/refresh-token', {
        token: refreshToken,
      });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      sessionStorage.setItem('authToken', newToken);
      sessionStorage.setItem('refreshToken', newRefreshToken);
      return newToken;
    }
    return null;
  } catch (error) {
    console.error('Failed to refresh auth token:', error);
    toast.error('登录已过期，请重新登录。');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
    window.location.href = '/delivery/login';
    return null;
  }
};

/**
 * Initialize Socket.IO Client
 * @param {string} [token] - JWT Token
 */
const initializeSocket = async (token) => {
  let currentToken = token || sessionStorage.getItem('authToken');

  console.info('Socket: Attempting to connect with token:', currentToken);

  // Cannot establish connection without token
  if (!currentToken) {
    console.error('Cannot establish Socket.IO connection without token');
    toast.error('无法连接到服务器，请登录后重试。');
    return;
  }

  // Decode and check token expiration
  try {
    const decoded = jwtDecode(currentToken);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.info('Token has expired, attempting to refresh token');
      currentToken = await refreshAuthToken();
      if (!currentToken) {
        throw new Error('Unable to refresh token');
      }
    }
  } catch (error) {
    console.error('Token validation failed:', error);
    toast.error('认证信息有误，请重新登录。');
    return;
  }

  // Prevent multiple connections with the same token
  if (currentToken === previousToken && socket && socket.connected) {
    console.warn('Socket is already connected with the same token');
    return;
  }

  previousToken = currentToken; // Update stored token for tracking

  // Clean up previous socket connection if exists
  if (socket) {
    console.info('Socket: Disconnecting previous connection');
    socket.off();
    socket.disconnect();
    socket = null;
  }

  // Establish new Socket.IO connection
  const SOCKET_URL =
    process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  socket = io(`${SOCKET_URL}/orders`, {
    transports: ['websocket', 'polling'],
    auth: {
      token: `Bearer ${currentToken}`,
    },
    reconnection: false, // Custom reconnection handled manually
    path: '/socket.io',
    secure: SOCKET_URL.startsWith('https'), // Ensure secure connection if using HTTPS/WSS
  });

  setupSocketListeners();
};

/**
 * Setup Socket.IO Event Listeners
 */
const setupSocketListeners = () => {
  if (!socket) return;

  socket.on('connect', () => {
    console.info('Connected to /orders namespace');
    reconnectAttempts = 0;
    reconnectDelay = RECONNECTION_DELAY_INITIAL;
  });

  socket.on('orderStatusUpdate', handleOrderStatusUpdate);
  socket.on('message', handleMessage);

  socket.on('disconnect', (reason) => {
    console.warn('Disconnected from /orders namespace. Reason:', reason);
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, do not auto-reconnect
      return;
    }
    attemptReconnection();
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
    toast.error('WebSocket 连接发生错误。');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error.message);
    if (error.message === 'Token 過期' && !isRefreshing) {
      console.warn('Token expired, attempting to refresh and reconnect');
      handleTokenExpiry();
    } else {
      toast.error('WebSocket 连接失败，正在尝试重新连接...');
      attemptReconnection();
    }
  });
};

/**
 * Handle Token Expiry by Refreshing Token and Reconnecting
 */
const handleTokenExpiry = async () => {
  isRefreshing = true;
  try {
    const newToken = await refreshAuthToken();
    if (newToken && socket) {
      socket.auth.token = `Bearer ${newToken}`;
      socket.connect();
      console.info('Socket token refreshed and reconnected successfully');
      toast.success('认证信息已更新，已重新连接服务器。');
    }
  } catch (error) {
    console.error('Failed to refresh token and reconnect:', error);
  } finally {
    isRefreshing = false;
  }
};

/**
 * Attempt to reconnect Socket.IO with exponential backoff
 */
const attemptReconnection = () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.warn('Reached maximum reconnection attempts. Giving up.');
    toast.error('无法连接到服务器，请检查您的网络或稍后重试。');
    return;
  }

  reconnectAttempts++;
  console.info(
    `Attempting to reconnect... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
  );

  setTimeout(async () => {
    const token = sessionStorage.getItem('authToken');
    await initializeSocket(token);
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECTION_DELAY);
  }, reconnectDelay);
};

/**
 * Get current Socket.IO instance
 * @returns {Socket|null} Socket.IO client instance or null
 */
export const getSocket = () => {
  if (!socket) {
    const token = sessionStorage.getItem('authToken');
    initializeSocket(token);
  }
  return socket;
};

/**
 * Reconnect Socket.IO manually
 */
export const reconnectSocket = async () => {
  if (socket) {
    socket.disconnect();
    const token = sessionStorage.getItem('authToken');
    await initializeSocket(token);
  }
};

/**
 * Disconnect Socket.IO
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.off();
    socket.disconnect();
    socket = null;
    reconnectAttempts = 0;
    reconnectDelay = RECONNECTION_DELAY_INITIAL;
    previousToken = null;
    console.info('Disconnected and cleared Socket.IO instance');
    toast.info('已断开与服务器的连接。');
  }
};

/**
 * Join a specific order room
 * @param {string} orderId - Order ID
 */
export const joinOrderRoom = (orderId) => {
  if (socket && socket.connected) {
    socket.emit('joinOrderRoom', { orderId }, (ack) => {
      if (ack && ack.status === 'ok') {
        console.info(`Joined order room: ${orderId}`);
        toast.success(`已加入订单房间：${orderId}`);
      } else {
        console.warn(
          `Failed to join order room: ${
            ack ? ack.message : 'No acknowledgment received'
          }`
        );
        toast.warn(`无法加入订单房间：${orderId}`);
      }
    });
  } else {
    console.warn('Socket is not connected. Cannot join order room.');
    toast.warn('尚未连接到服务器，无法加入订单房间。');
  }
};

/**
 * Leave a specific order room
 * @param {string} orderId - Order ID
 */
export const leaveOrderRoom = (orderId) => {
  if (socket && socket.connected) {
    socket.emit('leaveOrderRoom', { orderId }, (ack) => {
      if (ack && ack.status === 'ok') {
        console.info(`Left order room: ${orderId}`);
        toast.success(`已离开订单房间：${orderId}`);
      } else {
        console.warn(
          `Failed to leave order room: ${
            ack ? ack.message : 'No acknowledgment received'
          }`
        );
        toast.warn(`无法离开订单房间：${orderId}`);
      }
    });
  } else {
    console.warn('Socket is not connected. Cannot leave order room.');
    toast.warn('尚未连接到服务器，无法离开订单房间。');
  }
};

/**
 * Connect Socket.IO
 */
export const connectSocket = () => {
  const token = sessionStorage.getItem('authToken');
  initializeSocket(token);
};
