import { storeAuthToken } from "@utils/tokenStorage";
// src/utils/orderApi.js

import api from '@utils/api';

// 創建訂單
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders/create', orderData);
    return response.data;
  } catch (error) {
    console.error('無法創建訂單:', error);
    throw error;
  }
};

// 查詢訂單狀態
export const getOrderStatus = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('無法獲取訂單狀態:', error);
    throw error;
  }
};

// ... 添加其他訂單相關的方法
