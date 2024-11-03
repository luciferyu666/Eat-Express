// backend-project/utils/geocodeAddress.js

const axiosInstance = require('./axiosInstance');
// const logger = require('./logger');
const redisClient = require('../redisClient'); // 引入 Redis 客户端
const config = require('../config'); // 引入配置文件

const { GOOGLE_MAPS_API_KEY, NODE_ENV } = config;

if (!GOOGLE_MAPS_API_KEY) {
    console.error('缺少 GOOGLE_MAPS_API_KEY 环境变量');
  throw new Error('GOOGLE_MAPS_API_KEY 环境变量未设置');
}

/**
 * 将地址转换为经纬度坐标，并使用 Redis 缓存结果
 * @param {string} address - 需要编码的地址
 * @returns {Promise<{ latitude: number, longitude: number }>}
 */
const geocodeAddress = async (address) => {
  try {
    if (!address || typeof address !== 'string') {
        console.warn('提供的地址无效');
      throw new Error('提供的地址无效');
    }

    // 检查缓存
    const cacheKey = `geocode:${address}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      if (NODE_ENV !== 'production') {
        console.info(`从缓存中获取地理编码结果，地址: ${address}`);
      }
      return JSON.parse(cachedData);
    }

    // 发送 API 请求，使用相对路径
    const response = await axiosInstance.get('/geocode/json', {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    const { status, results } = response.data;

    if (status === 'ZERO_RESULTS') {
        console.warn(`没有找到该地址的地理编码结果，地址: ${address}`);
      throw new Error('没有找到该地址的地理编码结果');
    }

    if (status !== 'OK') {
        console.warn(`地理编码失败，地址: ${address}, 状态: ${status}`);
      throw new Error(`地理编码失败，状态: ${status}`);
    }

    const location = results[0].geometry.location;

    const result = {
      latitude: location.lat,
      longitude: location.lng,
    };

    // 将结果存入缓存，设置过期时间为 24 小时
    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 24 * 60 * 60);

    if (NODE_ENV !== 'production') {
        console.info(`地理编码成功，地址: ${address}, 纬度: ${result.latitude}, 经度: ${result.longitude}`);
    }

    return result;
  } catch (error) {
    if (error.response) {
      // 来自 API 的错误响应
      const status = error.response.data.status || 'UNKNOWN_ERROR';
      console.error(`地理编码 API 错误，状态: ${status}`, error.response.data);
      throw new Error(`地理编码 API 错误，状态: ${status}`);
    } else if (error.request) {
      // 请求已发出但未收到响应
      console.error(`地理编码请求未收到响应，地址: ${address}`, error);
      throw new Error('地理编码请求未收到响应，请稍后再试');
    } else {
      // 其他错误
      console.error(`地理编码时发生错误，地址: ${address}`, error);
      throw error;
    }
  }
};

module.exports = geocodeAddress;