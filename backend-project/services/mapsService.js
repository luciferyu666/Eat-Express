// backend-project/services/mapsService.js

const { axiosInstance, setToken, clearToken } = require('../utils/axiosInstance');
const config = require('../config');

/**
 * 獲取地理位置信息
 * @param {string} address - 地址
 * @returns {object} 地理位置信息
 */
const getGeocode = async (address) => {
  try {
    const response = await axiosInstance.get('/geocode/json', {
      params: {
        address,
        key: config.GOOGLE_MAPS_API_KEY, // 從配置文件中獲取 API Key
      },
    });
    return response.data;
  } catch (error) {
    console.error('獲取地理位置信息失敗:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  getGeocode,
};