import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/services/authService.js

import axiosInstance from 'axios';
import jwtDecode from 'jwt-decode';
import { API_BASE_URL } from '@constants/apiConstants'; // 確保此文件存在
import logger from '@utils/logger'; // 確保此文件存在

/**
 * 登錄函數
 * @param {Object} credentials - 用戶的登錄憑證（如郵箱和密碼）
 * @returns {Promise<Object>} - 返回登錄後的用戶數據和令牌
 */
const login = async (credentials) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/auth/login`,
      credentials
    );
    const { token } = response.data;

    // 存儲令牌（例如，在 localStorage 中）
    localStorage.setItem('authToken', token);

    // 解碼令牌以獲取用戶信息
    const user = jwtDecode(token);

    logger.log('User logged in successfully:', user);

    return { user, token };
  } catch (error) {
    logger.error('Login failed:', error);
    throw error;
  }
};

/**
 * 登出函數
 * @returns {Promise<void>} - 清除用戶的登錄狀態
 */
const logout = async () => {
  try {
    // 清除存儲的令牌
    localStorage.removeItem('authToken');

    logger.log('User logged out successfully.');
  } catch (error) {
    logger.error('Logout failed:', error);
    throw error;
  }
};

/**
 * 註冊函數
 * @param {Object} userData - 新用戶的註冊數據
 * @returns {Promise<Object>} - 返回註冊後的用戶數據和令牌
 */
const register = async (userData) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/auth/register`,
      userData
    );
    const { token } = response.data;

    // 存儲令牌（例如，在 localStorage 中）
    localStorage.setItem('authToken', token);

    // 解碼令牌以獲取用戶信息
    const user = jwtDecode(token);

    logger.log('User registered successfully:', user);

    return { user, token };
  } catch (error) {
    logger.error('Registration failed:', error);
    throw error;
  }
};

/**
 * 獲取當前用戶信息
 * @returns {Object|null} - 返回當前用戶信息或 null（如果未登錄）
 */
const getCurrentUser = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  try {
    const user = jwtDecode(token);
    return user;
  } catch (error) {
    logger.error('Failed to decode token:', error);
    return null;
  }
};

// 確保每個導出標識符僅被導出一次
export { login, logout, register, getCurrentUser };
