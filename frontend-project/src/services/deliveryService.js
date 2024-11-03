import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/services/deliveryService.js

import axiosInstance from '@utils/axiosInstance'; // 使用正確的路徑
import { toast } from 'react-toastify'; // 引入通知庫，如 react-toastify
import { DELIVERY_PERSON_API } from '@constants/apiPaths'; // 引入集中管理的 API 路徑

/**
 * 處理 API 請求的成功回應
 * @template T
 * @param {Object} response - Axios 回應對象
 * @param {string} successMessage - 成功日誌訊息
 * @returns {T} - 回應數據
 */
const handleResponse = (response, successMessage) => {
  console.info(successMessage);
  toast.success(successMessage); // 顯示成功通知
  return response.data;
};

/**
 * 處理 API 請求的錯誤回應
 * @param {any} error - Axios 錯誤對象
 * @param {string} errorMessage - 錯誤日誌前綴訊息
 */
const handleError = (error, errorMessage) => {
  const detailedError = error.response?.data?.error || error.message;
  console.error(`${errorMessage}: ${detailedError}`);
  toast.error(`${errorMessage}: ${detailedError}`); // 顯示錯誤通知
  throw error;
};

/**
 * 創建一個通用的 API 函數
 * @param {'get' | 'post' | 'put' | 'patch' | 'delete'} method - HTTP 方法
 * @param {string} url - API 端點
 * @param {string} successMessage - 成功日誌訊息
 * @param {string} errorMessage - 錯誤日誌前綴訊息
 * @returns {Function} - API 函數
 */
const createApiFunction = (method, url, successMessage, errorMessage) => {
  return async (data) => {
    try {
      let response;
      switch (method) {
        case 'get':
        case 'delete':
          response = await axiosInstance[method](url);
          break;
        case 'post':
        case 'put':
        case 'patch':
          response = await axiosInstance[method](url, data);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      return handleResponse(response, successMessage);
    } catch (error) {
      handleError(error, errorMessage);
    }
  };
};

// 定義具體的 API 函數
export const getCurrentOrders = createApiFunction(
  'get',
  DELIVERY_PERSON_API.ORDERS_CURRENT,
  '成功獲取當前訂單',
  '獲取當前訂單失敗'
);

export const getEarnings = createApiFunction(
  'get',
  DELIVERY_PERSON_API.EARNINGS,
  '成功獲取收益',
  '獲取收益失敗'
);

export const getOrderHistory = createApiFunction(
  'get',
  DELIVERY_PERSON_API.ORDERS_HISTORY,
  '成功獲取訂單歷史',
  '獲取訂單歷史失敗'
);

export const getProfile = createApiFunction(
  'get',
  DELIVERY_PERSON_API.PROFILE,
  '成功獲取個人資料',
  '獲取個人資料失敗'
);

export const updateProfile = createApiFunction(
  'put',
  DELIVERY_PERSON_API.PROFILE,
  '成功更新個人資料',
  '更新個人資料失敗'
);

export const getDeliveryPersonLocation = createApiFunction(
  'get',
  DELIVERY_PERSON_API.LOCATION,
  '成功獲取外送員位置',
  '獲取外送員位置失敗'
);

export const getStatus = createApiFunction(
  'get',
  DELIVERY_PERSON_API.STATUS,
  '成功獲取在線狀態',
  '獲取在線狀態失敗'
);

export const updateStatus = createApiFunction(
  'patch',
  DELIVERY_PERSON_API.STATUS,
  '成功更新在線狀態',
  '更新在線狀態失敗'
);
