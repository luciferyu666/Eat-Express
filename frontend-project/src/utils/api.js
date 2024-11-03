import { storeAuthToken } from "@utils/tokenStorage";
// src/utils/api.js

import axios from 'axios';
import { connectSocket, disconnectSocket } from '@utils/socket';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const loginPaths = {
  admin: '/admin/login',
  customer: '/user/login',
  restaurant: '/restaurants/login',
  delivery_person: '/delivery/login',
};

const api = axios.create({
  baseURL: API_BASE_URL, // 确保 baseURL 包含 /api
  headers: {
    'Content-Type': 'application/json',
  },
});

const getToken = () => localStorage.getItem('authToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          // 使用 api 实例和相对路径
          const response = await api.post('/auth/refresh', {
            token: refreshToken,
          });
          const newToken = response.data.authToken;

          localStorage.setItem('authToken', newToken);

          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          connectSocket();

          return api(originalRequest);
        } else {
          throw new Error('没有提供 Refresh Token');
        }
      } catch (refreshError) {
        console.error('刷新 Token 失败:', refreshError);
        handleTokenExpired();
      }
    }

    return Promise.reject(error);
  }
);

const handleTokenExpired = () => {
  const role = localStorage.getItem('role');

  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');

  disconnectSocket(); // 断开 Socket 连接

  const redirectPath = loginPaths[role] || '/';
  window.location.href = redirectPath;

  alert('您的登录已过期，请重新登录。');
};

export default api;
