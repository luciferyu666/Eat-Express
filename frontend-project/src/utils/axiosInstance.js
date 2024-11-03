import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/utils/axiosInstance.js

import axios from 'axios';

/**
 * 创建 Axios 实例
 */
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api', // 确保包含 /api
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: process.env.REACT_APP_API_TIMEOUT
    ? parseInt(process.env.REACT_APP_API_TIMEOUT, 10)
    : 10000, // 10秒
});

// 标志是否正在刷新 Token
let isRefreshing = false;

// 队列，用于存储等待刷新 Token 的请求
let failedQueue = [];

/**
 * 处理队列中的请求
 * @param {Object} error - 错误对象
 * @param {string|null} token - 新的 Token
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * 刷新 Token 请求
 * @param {string} refreshToken - 当前的刷新 Token
 * @returns {Promise<Object>} - 返回新的 Token 和刷新 Token
 */
const refreshTokenRequest = async (refreshToken) => {
  try {
    const response = await axios.post(
      `${axiosInstance.defaults.baseURL}/auth/refresh-token`,
      { token: refreshToken }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 获取用户角色
 * @returns {string} - 用户角色
 */
const getUserRole = () => {
  const userRole = sessionStorage.getItem('role');
  const validRoles = ['customer', 'admin', 'deliveryPerson', 'restaurant']; // 根据实际角色调整
  return validRoles.includes(userRole) ? userRole : 'customer'; // 默认角色为 'customer'
};

// 请求拦截器：附加 Authorization 头
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken'); // 使用统一的存储键
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (process.env.NODE_ENV !== 'production') {
        console.info(
          `Axios: Adding Authorization header to ${config.method.toUpperCase()} ${config.url}`
        );
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `Axios: No token found for ${config.method.toUpperCase()} ${config.url}`
        );
      }
    }
    return config;
  },
  (error) => {
    console.error('Axios 请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器，处理 401 错误并尝试刷新 Token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 检查是否是 401 错误并且请求未重试
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果 Token 正在刷新，将请求加入队列
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // 标记请求为已重试
      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = sessionStorage.getItem('refreshToken'); // 获取刷新 Token

      if (currentRefreshToken) {
        try {
          if (process.env.NODE_ENV !== 'production') {
            console.info('Axios: Attempting to refresh token');
          }

          const { token: newToken, refreshToken: newRefreshToken } = await refreshTokenRequest(currentRefreshToken);

          // 更新 sessionStorage 中的 Token
          sessionStorage.setItem('authToken', newToken);
          sessionStorage.setItem('refreshToken', newRefreshToken);

          // 更新 Axios 实例的默认 Authorization 头
          axiosInstance.defaults.headers['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          if (process.env.NODE_ENV !== 'production') {
            console.info(
              `Axios: Retrying original request to ${originalRequest.method.toUpperCase()} ${originalRequest.url} with new token`
            );
          }

          processQueue(null, newToken);

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          console.error('Axios: Token refresh failed:', refreshError);

          // 根据用户角色动态决定重定向路径
          const userRole = getUserRole();
          window.location.href = `/${userRole}/login`; // 根据角色或需求调整重定向路径
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // 没有刷新 Token，直接重定向到登录页面
        console.warn('Axios: No refresh token available');
        const userRole = getUserRole();
        window.location.href = `/${userRole}/login`; // 根据角色或需求调整重定向路径
        return Promise.reject(error);
      }
    }

    // 在非生产环境中记录其他响应错误
    if (process.env.NODE_ENV !== 'production') {
      console.error('Axios: Response error:', error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;