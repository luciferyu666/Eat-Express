import { storeAuthToken } from "@utils/tokenStorage";
// src/services/socketService.js

import { io } from 'socket.io-client';
import { refreshToken } from '@services/authService';

// 使用環境變量來配置服務器 URL，避免硬編碼
const SOCKET_SERVER_URL =
  process.env.REACT_APP_SOCKET_SERVER_URL || 'http://localhost:5000/orders';

// 單例模式管理 Socket 實例
let socket = null;
let isRefreshing = false;

/**
 * 連接到 Socket 服務器
 * @returns {Socket | null} 返回 Socket 實例或 null
 */
export function connectSocket() {
  if (socket) {
    return socket; // 如果已經存在，直接返回
  }

  const token = localStorage.getItem('authToken');
  if (token) {
    socket = io(SOCKET_SERVER_URL, {
      auth: { token }, // 使用 auth 參數傳遞令牌
      transports: ['websocket', 'polling'],
    });

    // 連接成功事件
    socket.on('connect', () => {
      console.log('Socket 連接成功');
    });

    // 連接錯誤事件
    socket.on('connect_error', async (error) => {
      if (error.message === 'Token 過期' && !isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshToken();
          if (newToken) {
            // 更新 auth 信息
            socket.auth.token = newToken;
            // 重新連接
            socket.connect();
            console.log('Socket 令牌刷新並重新連接成功');
          } else {
            throw new Error('無法獲取新令牌');
          }
        } catch (refreshError) {
          console.error('無法重連，因為刷新 Token 失敗:', refreshError);
          // 可選：在此處通知用戶重新登錄
        } finally {
          isRefreshing = false;
        }
      } else {
        console.error('Socket 連接錯誤:', error);
      }
    });

    // 斷開連接事件
    socket.on('disconnect', (reason) => {
      console.log('Socket 已斷開:', reason);
      socket = null; // 清除 Socket 實例
    });
  } else {
    console.warn('無 Token，無法建立 Socket 連接');
  }

  return socket;
}

/**
 * 斷開 Socket 連接
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket 已斷開');
  }
}

/**
 * 獲取 Socket 實例，如果尚未連接，則建立連接
 * @returns {Socket | null} 返回 Socket 實例或 null
 */
export function getSocket() {
  if (!socket) {
    connectSocket();
  }
  return socket;
}
