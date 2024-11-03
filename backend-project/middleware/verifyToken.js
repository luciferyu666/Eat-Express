// backend-project/middleware/verifyToken.js

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config'); // 引入配置文件中的 JWT_SECRET

// 确保环境变量中的 JWT_SECRET 存在且符合安全要求
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('Missing or invalid JWT_SECRET in environment variables');
}

// 在非生产环境中初始化日志
if (process.env.NODE_ENV !== 'production') {
  console.info('verifyToken middleware initialized.');
}

/**
 * JWT 验证中间件
 * 
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 * 
 * @description
 * 此中间件负责验证请求中的 JWT。它会检查 Authorization 头是否存在并符合 "Bearer <token>" 格式，
 * 然后使用 JWT_SECRET 验证 Token 的有效性。若验证成功，将解码后的用户信息（userId 和 role）附加到 req.user。
 * 若验证失败，则返回 401 未授权错误。
 */
const verifyToken = (req, res, next) => {
  // 从请求头中提取 Authorization 头
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.warn(`授權失敗：缺少 Authorization 標頭，來源 IP: ${req.ip}, 請求路徑: ${req.originalUrl}`);
    return res.status(401).json({ error: '缺少 Authorization 標頭' });
  }

  // 使用正则表达式提取 Token，确保格式为 "Bearer <token>"
  const matches = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = matches && matches[1];

  if (!token) {
    console.warn(`授權失敗：無效的 Authorization 格式，來源 IP: ${req.ip}, 請求路徑: ${req.originalUrl}`);
    return res.status(401).json({ error: '無效的 Authorization 格式' });
  }

  try {
    console.log("Entering middleware\\verifyToken.js");
    // 使用 JWT 秘密密钥验证 Token 的有效性，并验证特定的声明
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'your-app-name', // 替换为您的应用名称
      audience: 'your-app-audience', // 替换为您的应用受众
    });

    // 可选：检查 Token 是否被撤销（需实现 Token 黑名单机制）
    // const isBlacklisted = await checkTokenBlacklist(decoded.jti);
    // if (isBlacklisted) {
    //   console.warn(`授權失敗：Token 已被撤销，用户 ID: ${decoded.userId}`);
    //   return res.status(401).json({ error: '無效的 Token' });
    // }

    // 附加用户信息到请求对象上
    req.user = { userId: decoded.userId, role: decoded.role };

    if (process.env.NODE_ENV !== 'production') {
      console.info(`授權成功：用戶ID=${decoded.userId}, 角色=${decoded.role}, Token 有效期至=${new Date(decoded.exp * 1000).toISOString()}`);
    }

    next(); // 继续执行后续中间件或路由处理
  } catch (err) {
    console.warn(`授權失敗：${err.message}, 來源 IP: ${req.ip}, 請求路徑: ${req.originalUrl}`);
    console.log("Exiting middleware\\verifyToken.js with status code");
    return res.status(401).json({ error: '無效的 Token' });
  }
};

module.exports = verifyToken; // 导出 verifyToken 函数