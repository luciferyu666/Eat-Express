import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/services/axiosConfig.js

import axios from 'axios';

// 从环境变量中获取 API_BASE_URL，默认为 'http://localhost:5000'
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// 创建 Axios 实例，设置全局基础路径
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`, // 确保 baseURL 包含 /api
  withCredentials: true, // 如果需要传送 Cookie，设置为 true
});

// 设置拦截器以自动附加授权标头
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken'); // 使用 sessionStorage
    if (token) {
      // 附加授权标头
      config.headers['Authorization'] = `Bearer ${token}`;
      console.info(
        `Axios: Adding Authorization header to ${config.method.toUpperCase()} ${
          config.url
        }`
      );
    } else {
      console.warn(
        `Axios: No token found for ${config.method.toUpperCase()} ${config.url}`
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 设置拦截器以处理 401 错误并刷新 Token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 检查是否为 401 错误且尚未重试过
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = sessionStorage.getItem('refreshToken'); // 使用 sessionStorage
        if (!refreshToken) {
          throw new Error('没有刷新 Token');
        }

        // 使用 axiosInstance 发起刷新 Token 请求，使用相对路径
        const response = await axiosInstance.post('/auth/refresh-token', {
          token: refreshToken,
        });

        const { token: newToken, refreshToken: newRefreshToken } =
          response.data;

        // 更新 sessionStorage 中的 Token 和 Refresh Token
        sessionStorage.setItem('authToken', newToken);
        sessionStorage.setItem('refreshToken', newRefreshToken);

        // 更新 Axios 实例的授权标头
        axiosInstance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        console.info(
          `Axios: Token refreshed successfully. Retrying original request to ${originalRequest.method.toUpperCase()} ${
            originalRequest.url
          }`
        );

        // 重新发送原始请求
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error('Token 刷新失败，请重新登录。', err);
        // 清除 sessionStorage 中的 Token 和 Refresh Token
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('refreshToken');
        // 导航到登录页面
        window.location.href = '/admin/login'; // 根据角色或需求调整路径
        return Promise.reject(err);
      }
    }

    // 如果不是 401 错误，直接拒绝错误
    return Promise.reject(error);
  }
);

export default axiosInstance;
