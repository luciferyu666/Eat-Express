import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * 配置代理中间件
 * @param {import('express').Application} app - Express 应用实例
 */
module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000', // 后端服务器地址
      changeOrigin: true, // 是否修改请求的来源
      logLevel: 'debug', // 设置日志级别为 debug，用于调试代理问题
    })
  );
};
