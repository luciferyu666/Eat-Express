// src/setupAxios.js
import axios from 'axios';

// 設置 Axios 攔截器來附加 JWT Token
const setupAxiosInterceptors = () => {
  // Request 攔截器
  axios.interceptors.request.use(
    (config) => {
      // 從 localStorage 中獲取 JWT Token
      const token = localStorage.getItem('authToken');
      
      // 如果 Token 存在，將其添加到 Authorization 標頭
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response 攔截器可以在這裡處理 token 過期、錯誤等情況
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // 如果響應返回 401 未授權，這裡可以執行登出操作或者重定向到登入頁面
      if (error.response && error.response.status === 401) {
        // 執行登出或者重定向到登入頁面
        localStorage.removeItem('authToken'); // 清除已過期的 Token
        window.location.href = '/login'; // 重定向到登入頁面
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
