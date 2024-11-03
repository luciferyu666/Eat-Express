// backend-project/utils/axiosInstance.js

const axios = require('axios');
const config = require('../config'); // 引入配置文件

// 初始化 token 为 null
let API_TOKEN = config.API_TOKEN || null;

/**
 * 设置 Axios 实例的 Token
 * @param {string} token - 要设置的 Token
 */
const setToken = (token) => {
  API_TOKEN = token;
  console.info('Axios Instance: Token 已设置');
};

/**
 * 清除 Axios 实例的 Token
 */
const clearToken = () => {
  API_TOKEN = null;
  console.info('Axios Instance: Token 已清除');
};

// 创建 Axios 实例，可以在这里添加默认配置
const axiosInstance = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api', // 设置默认的 baseURL
  timeout: 5000, // 设置请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么

    // 如果有 token，附加到请求头
    if (API_TOKEN) {
      config.headers['Authorization'] = `Bearer ${API_TOKEN}`;
      console.info(`附加 Authorization Token 至请求头`);
    }

    console.info(`Axios 请求：${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    console.error('Axios 请求错误：', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 对响应数据做些什么
    return response;
  },
  (error) => {
    // 对响应错误做些什么
    console.error('Axios 响应错误：', error);
    return Promise.reject(error);
  }
);

/**
 * 设置默认的 Token（来自配置文件）
 * 如果需要动态设置，可以在其他模块中调用 setToken 函数
 */
if (API_TOKEN) {
  console.info('Axios Instance: 默认 Token 已设置');
}

module.exports = {
  axiosInstance,
  setToken,
  clearToken,
};